import { Response } from 'express';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CancellationRule } from '../models/types.js';

export class CancellationRuleController {
  public static index(req: AuthenticatedRequest, res: Response) {
    return res.json({
      success: true,
      data: db.cancellationRules,
    });
  }

  public static store(req: AuthenticatedRequest, res: Response) {
    const { name, hours_before, refund_percentage, is_active = true, description } = req.body;
    if (!name || hours_before === undefined || refund_percentage === undefined) {
      return res.status(422).json({
        success: false,
        message: 'name, hours_before, and refund_percentage are required.',
      });
    }

    const newRule: CancellationRule = {
      id: db.nextId('cancellationRules'),
      name,
      hours_before: Number(hours_before),
      refund_percentage: Number(refund_percentage),
      is_active: Boolean(is_active),
      description,
      created_at: new Date().toISOString(),
    };

    db.cancellationRules.push(newRule);
    db.save();

    return res.status(201).json({
      success: true,
      message: 'Cancellation rule created successfully',
      data: newRule,
    });
  }
}
