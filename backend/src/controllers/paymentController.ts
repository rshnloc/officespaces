import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Payment } from '../models/types.js';

export class PaymentController {
  public static index(req: AuthenticatedRequest, res: Response) {
    const list = db.payments.map((p) => {
      const booking = db.bookings.find((b) => b.id === p.booking_id);
      const customer = db.customers.find((c) => c.id === p.customer_id);
      return {
        ...p,
        booking,
        customer,
      };
    });

    list.sort((a, b) => b.created_at.localeCompare(a.created_at));

    return res.json({
      success: true,
      data: list,
    });
  }

  public static store(req: AuthenticatedRequest, res: Response) {
    const { booking: bookingId } = req.params;
    const { amount, gateway = 'manual', payment_method = 'cash', transaction_id } = req.body;

    const booking = db.bookings.find((b) => b.id === Number(bookingId));
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const txnId = transaction_id || `TXN-${Date.now()}`;
    const now = new Date().toISOString();

    const payment: Payment = {
      id: db.nextId('payments'),
      uuid: uuidv4(),
      booking_id: booking.id,
      customer_id: booking.customer_id,
      transaction_id: txnId,
      gateway,
      amount: Number(amount) || booking.final_amount,
      currency: booking.currency || 'INR',
      status: 'paid',
      payment_method,
      payment_date: now,
      created_at: now,
    };

    db.payments.push(payment);
    booking.payment_status = 'paid';
    booking.status = 'confirmed';
    booking.updated_at = now;

    db.bookingStatusHistory.push({
      id: db.nextId('bookingStatusHistory'),
      booking_id: booking.id,
      from_status: 'pending',
      to_status: 'confirmed',
      changed_by_user_id: req.user ? req.user.id : null,
      notes: `Payment of ₹${payment.amount} recorded (${payment_method})`,
      created_at: now,
    });

    db.logAudit('record_payment', `Recorded payment of ₹${payment.amount} for booking #${booking.booking_number}`, req.user, null, payment);
    db.save();

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    });
  }

  public static processRefund(req: AuthenticatedRequest, res: Response) {
    const { payment: paymentId } = req.params;
    const payment = db.payments.find((p) => p.id === Number(paymentId));

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    payment.status = 'refunded';
    const booking = db.bookings.find((b) => b.id === payment.booking_id);
    if (booking) {
      booking.payment_status = 'refunded';
    }

    db.logAudit('process_refund', `Processed refund for payment #${payment.id}`, req.user);
    db.save();

    return res.json({
      success: true,
      message: 'Payment refunded successfully',
      data: payment,
    });
  }
}
