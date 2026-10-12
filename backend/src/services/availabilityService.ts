import { db } from '../database/store.js';
import { OfficeSpace } from '../models/types.js';

function formatDisplayTime(time24: string): string {
  const parts = time24.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  const hStr = h < 10 ? `0${h}` : `${h}`;
  return `${hStr}:${m} ${ampm}`;
}

export class AvailabilityService {
  public static getAvailableSlots(space: OfficeSpace, dateString: string) {
    const dateObj = new Date(`${dateString}T00:00:00Z`);
    const dayOfWeek = dateObj.getUTCDay();

    // 1. Check whole day blocked
    const wholeDayBlocked = db.blockedDates.some(
      (b) =>
        (!b.office_space_id || b.office_space_id === space.id) &&
        b.blocked_date === dateString &&
        !b.start_time
    );

    if (wholeDayBlocked) {
      return {
        date: dateString,
        is_available: false,
        reason: 'This date is blocked for maintenance or private events.',
        slots: [],
      };
    }

    // 2. Check holiday
    const holiday = db.holidays.find((h) => {
      if (h.date === dateString) return true;
      if (h.is_recurring) {
        const hParts = h.date.split('-');
        return (
          dateObj.getUTCMonth() + 1 === parseInt(hParts[1], 10) &&
          dateObj.getUTCDate() === parseInt(hParts[2], 10)
        );
      }
      return false;
    });

    if (holiday) {
      return {
        date: dateString,
        is_available: false,
        reason: `Holiday: ${holiday.name}`,
        slots: [],
      };
    }

    // 3. Find availability rule
    const rule = db.availabilityRules.find(
      (r) =>
        (!r.office_space_id || r.office_space_id === space.id) &&
        r.day_of_week === dayOfWeek &&
        r.is_active
    );

    if (!rule) {
      if (dayOfWeek === 0) {
        return {
          date: dateString,
          is_available: false,
          reason: 'Closed on Sundays',
          slots: [],
        };
      }
    }

    const openTimeStr = rule ? rule.open_time : '08:00:00';
    const closeTimeStr = rule ? rule.close_time : '20:00:00';
    const slotDurationMinutes = rule?.slot_duration_minutes || 60;

    const [openH, openM] = openTimeStr.split(':').map(Number);
    const [closeH, closeM] = closeTimeStr.split(':').map(Number);
    const openTotalMin = openH * 60 + (openM || 0);
    const closeTotalMin = closeH * 60 + (closeM || 0);

    // 4. Fetch existing active bookings for this space and date
    const activeBookings = db.bookings.filter(
      (b) =>
        b.office_space_id === space.id &&
        b.booking_date === dateString &&
        !['cancelled', 'rejected'].includes(b.status)
    );

    // 5. Fetch partial blocks
    const partialBlocks = db.blockedDates.filter(
      (b) =>
        (!b.office_space_id || b.office_space_id === space.id) &&
        b.blocked_date === dateString &&
        b.start_time
    );

    // 6. Current time check if date is today
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isToday = dateString === todayStr;
    const currentTotalMin = now.getHours() * 60 + now.getMinutes();

    // 7. Generate slots
    const slots = [];
    let curMin = openTotalMin;

    while (curMin + slotDurationMinutes <= closeTotalMin) {
      const nextMin = curMin + slotDurationMinutes;

      const startH = Math.floor(curMin / 60);
      const startM = curMin % 60;
      const endH = Math.floor(nextMin / 60);
      const endM = nextMin % 60;

      const slotStart = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}:00`;
      const slotEnd = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
      const display = `${formatDisplayTime(slotStart)} - ${formatDisplayTime(slotEnd)}`;

      const isPast = isToday && curMin <= currentTotalMin;

      // Check conflict with bookings
      const isBooked = activeBookings.some((b) => {
        const [bStartH, bStartM] = b.start_time.split(':').map(Number);
        const [bEndH, bEndM] = b.end_time.split(':').map(Number);
        const bStart = bStartH * 60 + (bStartM || 0);
        const bEnd = bEndH * 60 + (bEndM || 0);
        return curMin < bEnd && nextMin > bStart;
      });

      // Check conflict with partial blocks
      const isSlotBlocked = partialBlocks.some((b) => {
        if (!b.start_time || !b.end_time) return false;
        const [pStartH, pStartM] = b.start_time.split(':').map(Number);
        const [pEndH, pEndM] = b.end_time.split(':').map(Number);
        const pStart = pStartH * 60 + (pStartM || 0);
        const pEnd = pEndH * 60 + (pEndM || 0);
        return curMin < pEnd && nextMin > pStart;
      });

      const isAvailable = !isPast && !isBooked && !isSlotBlocked;

      let reason = 'Available';
      if (isPast) reason = 'Past slot';
      else if (isBooked) reason = 'Already booked';
      else if (isSlotBlocked) reason = 'Maintenance/Blocked';

      slots.push({
        start_time: slotStart,
        end_time: slotEnd,
        display,
        is_available: isAvailable,
        reason,
      });

      curMin = nextMin;
    }

    return {
      date: dateString,
      is_available: slots.some((s) => s.is_available),
      slots,
    };
  }

  public static isSlotAvailable(
    space: OfficeSpace,
    dateString: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: number
  ): boolean {
    // 1. Check whole day blocked
    const wholeDayBlocked = db.blockedDates.some(
      (b) =>
        (!b.office_space_id || b.office_space_id === space.id) &&
        b.blocked_date === dateString &&
        !b.start_time
    );
    if (wholeDayBlocked) return false;

    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    const reqStart = sH * 60 + (sM || 0);
    const reqEnd = eH * 60 + (eM || 0);

    // 2. Check partial blocked
    const partialBlocked = db.blockedDates.some((b) => {
      if ((b.office_space_id && b.office_space_id !== space.id) || b.blocked_date !== dateString) {
        return false;
      }
      if (!b.start_time || !b.end_time) return false;
      const [bStartH, bStartM] = b.start_time.split(':').map(Number);
      const [bEndH, bEndM] = b.end_time.split(':').map(Number);
      const bStart = bStartH * 60 + (bStartM || 0);
      const bEnd = bEndH * 60 + (bEndM || 0);
      return reqStart < bEnd && reqEnd > bStart;
    });
    if (partialBlocked) return false;

    // 3. Check conflicting bookings
    const hasConflict = db.bookings.some((b) => {
      if (excludeBookingId && b.id === excludeBookingId) return false;
      if (b.office_space_id !== space.id || b.booking_date !== dateString) return false;
      if (['cancelled', 'rejected'].includes(b.status)) return false;

      const [bStartH, bStartM] = b.start_time.split(':').map(Number);
      const [bEndH, bEndM] = b.end_time.split(':').map(Number);
      const bStart = bStartH * 60 + (bStartM || 0);
      const bEnd = bEndH * 60 + (bEndM || 0);

      return reqStart < bEnd && reqEnd > bStart;
    });

    return !hasConflict;
  }

  public static getMonthlyCalendar(space: OfficeSpace, year: number, month: number) {
    const monthStr = String(month).padStart(2, '0');
    const startPrefix = `${year}-${monthStr}`;

    const bookings = db.bookings
      .filter(
        (b) =>
          b.office_space_id === space.id &&
          b.booking_date.startsWith(startPrefix) &&
          !['cancelled', 'rejected'].includes(b.status)
      )
      .map((b) => ({
        booking_date: b.booking_date,
        start_time: b.start_time,
        end_time: b.end_time,
        status: b.status,
        booking_number: b.booking_number,
      }));

    const blockedDates = db.blockedDates.filter(
      (b) =>
        (!b.office_space_id || b.office_space_id === space.id) &&
        b.blocked_date.startsWith(startPrefix)
    );

    const holidays = db.holidays.filter((h) => {
      const hMonth = parseInt(h.date.split('-')[1], 10);
      return hMonth === month;
    });

    return {
      year,
      month,
      bookings,
      blocked_dates: blockedDates,
      holidays,
    };
  }
}
