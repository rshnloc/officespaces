import { Response } from 'express';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class CustomerController {
  public static index(req: AuthenticatedRequest, res: Response) {
    const { search } = req.query;
    let list = db.customers;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.company && c.company.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      data: list,
    });
  }

  public static show(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const customer = db.customers.find((c) => c.id === Number(id));

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const bookings = db.bookings
      .filter((b) => b.customer_id === customer.id)
      .map((b) => db.populateBooking(b));

    return res.json({
      success: true,
      data: {
        ...customer,
        bookings,
      },
    });
  }

  public static bookings(req: AuthenticatedRequest, res: Response) {
    const { customer: customerId } = req.params;
    const bookings = db.bookings
      .filter((b) => b.customer_id === Number(customerId))
      .map((b) => db.populateBooking(b));

    return res.json({
      success: true,
      data: bookings,
    });
  }
}
