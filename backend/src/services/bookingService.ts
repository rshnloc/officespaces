import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/store.js';
import { Booking, BookingStatus, Customer, User } from '../models/types.js';
import { AvailabilityService } from './availabilityService.js';
import { PricingService } from './pricingService.js';

export interface CreateBookingInput {
  office_space_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  pricing_unit?: string;
  num_people?: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  coupon_code?: string;
  customer_notes?: string;
  admin_notes?: string;
  user_id?: number | null;
}

export class BookingService {
  public static createBooking(input: CreateBookingInput, currentUser?: User | null): Booking {
    const space = db.spaces.find((s) => s.id === Number(input.office_space_id));
    if (!space) {
      throw new Error(`Office space with ID ${input.office_space_id} not found.`);
    }

    const date = input.booking_date;
    const startTime = input.start_time.length === 5 ? `${input.start_time}:00` : input.start_time;
    const endTime = input.end_time.length === 5 ? `${input.end_time}:00` : input.end_time;

    // Check availability
    const isAvailable = AvailabilityService.isSlotAvailable(space, date, startTime, endTime);
    if (!isAvailable) {
      throw new Error('The selected office space is not available for this date and time.');
    }

    // Customer find or create
    let customer: Customer | undefined;
    if (currentUser) {
      customer = db.customers.find((c) => c.user_id === currentUser.id);
    }
    if (!customer) {
      customer = db.customers.find((c) => c.email.toLowerCase() === input.email.trim().toLowerCase());
    }

    const now = new Date().toISOString();

    if (!customer) {
      const newCustId = db.nextId('customers');
      customer = {
        id: newCustId,
        uuid: uuidv4(),
        user_id: currentUser ? currentUser.id : null,
        name: input.name,
        email: input.email.trim().toLowerCase(),
        phone: input.phone,
        company: input.company,
        status: 'active',
        created_at: now,
        updated_at: now,
      };
      db.customers.push(customer);
    }

    // Pricing calculation
    const pricing = PricingService.calculate({
      officeSpace: space,
      bookingDate: date,
      startTime,
      endTime,
      pricingUnit: input.pricing_unit || space.pricing_unit,
      couponCode: input.coupon_code,
      customerId: customer.id,
    });

    // Unique booking number
    const bookingCount = db.bookings.length + 10001;
    const bookingNumber = `BK-${bookingCount}`;

    const newBookingId = db.nextId('bookings');
    const booking: Booking = {
      id: newBookingId,
      uuid: uuidv4(),
      booking_number: bookingNumber,
      customer_id: customer.id,
      user_id: currentUser ? currentUser.id : null,
      office_space_id: space.id,
      booking_date: date,
      start_time: startTime,
      end_time: endTime,
      duration_hours: pricing.duration_hours,
      duration_days: pricing.duration_days,
      pricing_unit: pricing.pricing_unit as any,
      num_people: input.num_people || 1,
      base_price: pricing.base_price,
      discount_amount: pricing.discount_amount,
      coupon_id: pricing.coupon_id || null,
      tax_amount: pricing.tax_amount,
      tax_id: pricing.tax_id || null,
      final_amount: pricing.final_amount,
      currency: pricing.currency,
      status: 'pending',
      payment_status: 'unpaid',
      customer_notes: input.customer_notes,
      admin_notes: input.admin_notes,
      created_at: now,
      updated_at: now,
    };

    db.bookings.unshift(booking);

    // Record coupon usage
    if (pricing.coupon_id) {
      const coupon = db.coupons.find((c) => c.id === pricing.coupon_id);
      if (coupon) {
        coupon.used_count += 1;
        db.couponUsages.push({
          id: db.nextId('couponUsages'),
          coupon_id: coupon.id,
          customer_id: customer.id,
          booking_id: booking.id,
          discount_applied: pricing.discount_amount,
          created_at: now,
        });
      }
    }

    // Record initial status history
    db.bookingStatusHistory.push({
      id: db.nextId('bookingStatusHistory'),
      booking_id: booking.id,
      from_status: null,
      to_status: 'pending',
      changed_by_user_id: currentUser ? currentUser.id : null,
      notes: 'Booking created by customer or admin.',
      created_at: now,
    });

    db.logAudit('create_booking', `Created booking #${booking.booking_number}`, currentUser, null, booking);
    db.save();

    return booking;
  }

  public static updateStatus(bookingId: number, newStatus: BookingStatus, notes?: string, user?: User | null): Booking {
    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error(`Booking #${bookingId} not found.`);
    }

    const oldStatus = booking.status;
    if (oldStatus === newStatus) {
      return booking;
    }

    const now = new Date().toISOString();
    booking.status = newStatus;
    booking.updated_at = now;

    if (newStatus === 'confirmed' && booking.payment_status === 'unpaid') {
      booking.payment_status = 'paid';
    }

    db.bookingStatusHistory.push({
      id: db.nextId('bookingStatusHistory'),
      booking_id: booking.id,
      from_status: oldStatus,
      to_status: newStatus,
      changed_by_user_id: user ? user.id : null,
      notes: notes || `Status updated to ${newStatus}`,
      created_at: now,
    });

    db.logAudit(
      'update_booking_status',
      `Booking #${booking.booking_number} status changed from ${oldStatus} to ${newStatus}`,
      user,
      { status: oldStatus },
      { status: newStatus }
    );
    db.save();

    return booking;
  }

  public static reschedule(
    bookingId: number,
    data: { booking_date: string; start_time: string; end_time: string; reason?: string },
    user?: User | null
  ): Booking {
    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error(`Booking #${bookingId} not found.`);
    }

    const space = db.spaces.find((s) => s.id === booking.office_space_id);
    if (!space) {
      throw new Error('Associated office space not found.');
    }

    const startTime = data.start_time.length === 5 ? `${data.start_time}:00` : data.start_time;
    const endTime = data.end_time.length === 5 ? `${data.end_time}:00` : data.end_time;

    const isAvailable = AvailabilityService.isSlotAvailable(space, data.booking_date, startTime, endTime, booking.id);
    if (!isAvailable) {
      throw new Error('New time slot is not available.');
    }

    const oldDate = booking.booking_date;
    const oldTimes = `${booking.start_time} - ${booking.end_time}`;

    booking.booking_date = data.booking_date;
    booking.start_time = startTime;
    booking.end_time = endTime;
    booking.updated_at = new Date().toISOString();

    db.bookingStatusHistory.push({
      id: db.nextId('bookingStatusHistory'),
      booking_id: booking.id,
      from_status: booking.status,
      to_status: booking.status,
      changed_by_user_id: user ? user.id : null,
      notes: `Rescheduled from ${oldDate} (${oldTimes}) to ${data.booking_date} (${startTime}-${endTime}). Reason: ${data.reason || 'None'}`,
      created_at: new Date().toISOString(),
    });

    db.logAudit(
      'reschedule_booking',
      `Booking #${booking.booking_number} rescheduled to ${data.booking_date}`,
      user
    );
    db.save();

    return booking;
  }

  public static exportCsv(): string {
    const headers = [
      'Booking Number',
      'Customer Name',
      'Customer Email',
      'Space Name',
      'Booking Date',
      'Start Time',
      'End Time',
      'Duration (Hours)',
      'Status',
      'Payment Status',
      'Final Amount (INR)',
      'Created At',
    ];

    const rows = db.bookings.map((b) => {
      const populated = db.populateBooking(b);
      return [
        b.booking_number,
        `"${populated.customer?.name || 'N/A'}"`,
        `"${populated.customer?.email || 'N/A'}"`,
        `"${populated.office_space?.name || 'N/A'}"`,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.duration_hours,
        b.status,
        b.payment_status,
        b.final_amount,
        b.created_at,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
