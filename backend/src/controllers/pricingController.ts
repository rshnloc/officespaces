import { Response } from 'express';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { PricingRule } from '../models/types.js';
import { PricingService } from '../services/pricingService.js';

export class PricingController {
  public static calculate(req: AuthenticatedRequest, res: Response) {
    const { officeSpace: spaceId } = req.params;
    const { booking_date, start_time, end_time, pricing_unit, coupon_code } = req.body;

    if (!booking_date || !start_time || !end_time) {
      return res.status(422).json({
        success: false,
        message: 'booking_date, start_time, and end_time are required.',
      });
    }

    const space = db.spaces.find((s) => s.id === Number(spaceId) || s.slug === spaceId);
    if (!space) {
      return res.status(404).json({ success: false, message: 'Office space not found.' });
    }

    const customerId = req.user ? db.customers.find((c) => c.user_id === req.user?.id)?.id : null;

    const calculation = PricingService.calculate({
      officeSpace: space,
      bookingDate: booking_date,
      startTime: start_time,
      endTime: end_time,
      pricingUnit: pricing_unit,
      couponCode: coupon_code,
      customerId,
    });

    return res.json({
      success: true,
      data: calculation,
    });
  }

  public static indexRules(req: AuthenticatedRequest, res: Response) {
    const { officeSpace: spaceId } = req.params;
    const rules = db.pricingRules.filter((r) => r.office_space_id === Number(spaceId));

    return res.json({
      success: true,
      data: rules,
    });
  }

  public static storeRule(req: AuthenticatedRequest, res: Response) {
    const { officeSpace: spaceId } = req.params;
    const { pricing_unit, base_price, weekend_price, holiday_price, minimum_hours = 1, currency = 'INR', is_active = true } = req.body;

    if (!pricing_unit || base_price === undefined) {
      return res.status(422).json({ success: false, message: 'pricing_unit and base_price are required.' });
    }

    const newRule: PricingRule = {
      id: db.nextId('pricingRules'),
      office_space_id: Number(spaceId),
      pricing_unit,
      base_price: Number(base_price),
      weekend_price: weekend_price ? Number(weekend_price) : undefined,
      holiday_price: holiday_price ? Number(holiday_price) : undefined,
      minimum_hours: Number(minimum_hours),
      currency,
      is_active: Boolean(is_active),
      created_at: new Date().toISOString(),
    };

    db.pricingRules.push(newRule);
    db.save();

    return res.status(201).json({
      success: true,
      message: 'Pricing rule created successfully',
      data: newRule,
    });
  }

  public static destroyRule(req: AuthenticatedRequest, res: Response) {
    const { pricingRule: ruleId } = req.params;
    const idx = db.pricingRules.findIndex((r) => r.id === Number(ruleId));

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Pricing rule not found.' });
    }

    db.pricingRules.splice(idx, 1);
    db.save();

    return res.json({
      success: true,
      message: 'Pricing rule deleted successfully',
    });
  }
}
