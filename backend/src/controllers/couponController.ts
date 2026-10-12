import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Coupon } from '../models/types.js';

export class CouponController {
  public static validateCoupon(req: AuthenticatedRequest, res: Response) {
    const { code, amount } = req.body;

    if (!code || amount === undefined) {
      return res.status(422).json({
        success: false,
        message: 'Coupon code and booking amount are required.',
      });
    }

    const codeUpper = String(code).trim().toUpperCase();
    const coupon = db.coupons.find((c) => c.code.toUpperCase() === codeUpper && c.status === 'active');

    if (!coupon) {
      return res.json({
        success: true,
        data: {
          valid: false,
          discount: 0,
          message: 'Invalid or expired coupon code.',
        },
      });
    }

    const numAmount = Number(amount);
    if (coupon.min_booking_amount && numAmount < coupon.min_booking_amount) {
      return res.json({
        success: true,
        data: {
          valid: false,
          discount: 0,
          message: `Minimum booking amount of ₹${coupon.min_booking_amount} required for this coupon.`,
        },
      });
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.json({
        success: true,
        data: {
          valid: false,
          discount: 0,
          message: 'Coupon has reached its maximum usage limit.',
        },
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round(((numAmount * coupon.discount_value) / 100) * 100) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = Math.min(numAmount, coupon.discount_value);
    }

    return res.json({
      success: true,
      data: {
        valid: true,
        discount,
        code: coupon.code,
        description: coupon.description,
        message: `Coupon ${coupon.code} applied successfully!`,
      },
    });
  }

  public static adminIndex(req: AuthenticatedRequest, res: Response) {
    return res.json({
      success: true,
      data: db.coupons,
    });
  }

  public static store(req: AuthenticatedRequest, res: Response) {
    const {
      code,
      description,
      discount_type = 'percentage',
      discount_value,
      min_booking_amount = 0,
      max_discount,
      usage_limit = 1000,
      per_customer_limit = 1,
      status = 'active',
    } = req.body;

    if (!code || discount_value === undefined) {
      return res.status(422).json({ success: false, message: 'Coupon code and discount_value are required.' });
    }

    const codeUpper = String(code).trim().toUpperCase();
    const existing = db.coupons.find((c) => c.code.toUpperCase() === codeUpper);
    if (existing) {
      return res.status(422).json({ success: false, message: 'A coupon with this code already exists.' });
    }

    const newCoupon: Coupon = {
      id: db.nextId('coupons'),
      uuid: uuidv4(),
      code: codeUpper,
      description,
      discount_type,
      discount_value: Number(discount_value),
      min_booking_amount: Number(min_booking_amount) || 0,
      max_discount: max_discount ? Number(max_discount) : undefined,
      usage_limit: Number(usage_limit),
      per_customer_limit: Number(per_customer_limit),
      used_count: 0,
      status,
      created_at: new Date().toISOString(),
    };

    db.coupons.push(newCoupon);
    db.save();

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: newCoupon,
    });
  }

  public static destroy(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const idx = db.coupons.findIndex((c) => c.id === Number(id));

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    db.coupons.splice(idx, 1);
    db.save();

    return res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  }
}
