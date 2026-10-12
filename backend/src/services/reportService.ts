import { db } from '../database/store.js';

export class ReportService {
  public static getDashboardSummary(filter = 'this_month') {
    const today = new Date().toISOString().split('T')[0];
    const totalSpaces = db.spaces.length;

    // Occupied spaces today
    const occupiedSpaceIds = new Set(
      db.bookings
        .filter((b) => b.booking_date === today && ['confirmed', 'checked_in'].includes(b.status))
        .map((b) => b.office_space_id)
    );

    const occupiedCount = occupiedSpaceIds.size;
    const availableCount = Math.max(0, totalSpaces - occupiedCount);
    const occupancyRate = totalSpaces > 0 ? Math.round((occupiedCount / totalSpaces) * 1000) / 10 : 0;

    // Bookings breakdown
    const totalBookings = db.bookings.length;
    const pendingBookings = db.bookings.filter((b) => b.status === 'pending').length;
    const confirmedBookings = db.bookings.filter((b) => b.status === 'confirmed').length;
    const checkedInBookings = db.bookings.filter((b) => b.status === 'checked_in').length;
    const completedBookings = db.bookings.filter((b) => b.status === 'completed').length;
    const cancelledBookings = db.bookings.filter((b) => b.status === 'cancelled').length;
    const rejectedBookings = db.bookings.filter((b) => b.status === 'rejected').length;

    const todayBookings = db.bookings.filter((b) => b.booking_date === today).length;
    const upcomingBookings = db.bookings.filter((b) => b.booking_date > today && ['confirmed', 'pending'].includes(b.status)).length;

    // Revenue
    const currentMonthPrefix = today.substring(0, 7); // YYYY-MM
    const currentMonthRevenue = db.payments
      .filter((p) => p.status === 'paid' && p.payment_date.startsWith(currentMonthPrefix))
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    const totalRevenue = db.payments
      .filter((p) => p.status === 'paid')
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    return {
      filter,
      spaces: {
        total: totalSpaces,
        available: availableCount,
        occupied: occupiedCount,
        occupancy_rate: occupancyRate,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        checked_in: checkedInBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        rejected: rejectedBookings,
        today: todayBookings,
        upcoming: upcomingBookings,
      },
      customers: {
        total: db.customers.length,
      },
      revenue: {
        range_total: totalRevenue,
        current_month: currentMonthRevenue,
        currency: 'INR',
      },
    };
  }

  public static getCharts(filter = 'this_month') {
    // Group payments and bookings by date
    const dateMap = new Map<string, { date: string; total_bookings: number; revenue: number }>();

    for (const b of db.bookings) {
      const entry = dateMap.get(b.booking_date) || { date: b.booking_date, total_bookings: 0, revenue: 0 };
      entry.total_bookings += 1;
      dateMap.set(b.booking_date, entry);
    }

    for (const p of db.payments) {
      if (p.status === 'paid') {
        const dateStr = p.payment_date.split('T')[0];
        const entry = dateMap.get(dateStr) || { date: dateStr, total_bookings: 0, revenue: 0 };
        entry.revenue += p.amount;
        dateMap.set(dateStr, entry);
      }
    }

    const trends = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Space type distribution
    const spaceTypeMap = new Map<string, number>();
    for (const s of db.spaces) {
      spaceTypeMap.set(s.space_type, (spaceTypeMap.get(s.space_type) || 0) + 1);
    }

    const spaceDistribution = Array.from(spaceTypeMap.entries()).map(([space_type, count]) => ({
      space_type,
      count,
    }));

    return {
      filter,
      trends,
      space_distribution: spaceDistribution,
    };
  }
}
