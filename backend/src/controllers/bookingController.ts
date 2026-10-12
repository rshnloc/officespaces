import { Response } from 'express';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { BookingStatus } from '../models/types.js';
import { BookingService } from '../services/bookingService.js';

export class BookingController {
  public static store(req: AuthenticatedRequest, res: Response) {
    try {
      const booking = BookingService.createBooking(req.body, req.user);
      return res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: db.populateBooking(booking),
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to create booking',
      });
    }
  }

  public static show(req: AuthenticatedRequest, res: Response) {
    const { identifier } = req.params;
    const isNum = !isNaN(Number(identifier));

    const booking = db.bookings.find(
      (b) => (isNum && b.id === Number(identifier)) || b.booking_number === identifier || b.uuid === identifier
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    return res.json({
      success: true,
      data: db.populateBooking(booking),
    });
  }

  public static myBookings(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { status } = req.query;
    let list = db.bookings.filter(
      (b) => b.user_id === req.user!.id || db.customers.find((c) => c.user_id === req.user!.id)?.id === b.customer_id
    );

    if (status && typeof status === 'string') {
      list = list.filter((b) => b.status === status);
    }

    list.sort((a, b) => b.created_at.localeCompare(a.created_at));

    return res.json({
      success: true,
      data: list.map((b) => db.populateBooking(b)),
    });
  }

  public static cancel(req: AuthenticatedRequest, res: Response) {
    const { booking: bookingId } = req.params;
    const { reason } = req.body;

    const booking = db.bookings.find((b) => b.id === Number(bookingId));
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isAdmin = req.user && ['super_admin', 'admin', 'manager'].includes(req.user.role);
    if (!isAdmin) {
      const isOwner =
        booking.user_id === req.user?.id ||
        db.customers.find((c) => c.user_id === req.user?.id)?.id === booking.customer_id;

      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
      }
    }

    try {
      const updated = BookingService.updateStatus(
        booking.id,
        'cancelled',
        reason || 'Cancelled by user/admin',
        req.user
      );
      return res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: db.populateBooking(updated),
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  public static adminIndex(req: AuthenticatedRequest, res: Response) {
    const { status, payment_status, office_space_id, search, date } = req.query;

    let list = db.bookings;

    if (status) {
      list = list.filter((b) => b.status === status);
    }
    if (payment_status) {
      list = list.filter((b) => b.payment_status === payment_status);
    }
    if (office_space_id) {
      list = list.filter((b) => b.office_space_id === Number(office_space_id));
    }
    if (date) {
      list = list.filter((b) => b.booking_date === date);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter((b) => {
        const cust = db.customers.find((c) => c.id === b.customer_id);
        return (
          b.booking_number.toLowerCase().includes(q) ||
          cust?.name.toLowerCase().includes(q) ||
          cust?.email.toLowerCase().includes(q)
        );
      });
    }

    list.sort((a, b) => b.created_at.localeCompare(a.created_at));

    return res.json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: list.map((b) => db.populateBooking(b)),
    });
  }

  public static updateStatus(req: AuthenticatedRequest, res: Response) {
    const { booking: bookingId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(422).json({ success: false, message: 'Status is required.' });
    }

    try {
      const updated = BookingService.updateStatus(Number(bookingId), status as BookingStatus, notes, req.user);
      return res.json({
        success: true,
        message: `Booking status updated to ${status}`,
        data: db.populateBooking(updated),
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  public static reschedule(req: AuthenticatedRequest, res: Response) {
    const { booking: bookingId } = req.params;
    const { booking_date, start_time, end_time, reason } = req.body;

    if (!booking_date || !start_time || !end_time) {
      return res.status(422).json({
        success: false,
        message: 'booking_date, start_time, and end_time are required.',
      });
    }

    try {
      const updated = BookingService.reschedule(
        Number(bookingId),
        { booking_date, start_time, end_time, reason },
        req.user
      );
      return res.json({
        success: true,
        message: 'Booking rescheduled successfully',
        data: db.populateBooking(updated),
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  public static exportCsv(req: AuthenticatedRequest, res: Response) {
    const csvContent = BookingService.exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="gramwork-bookings-export.csv"');
    return res.status(200).send(csvContent);
  }
}
