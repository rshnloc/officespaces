import { Response } from 'express';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Tax } from '../models/types.js';

export class TaxController {
  public static index(req: AuthenticatedRequest, res: Response) {
    return res.json({
      success: true,
      data: db.taxes,
    });
  }

  public static store(req: AuthenticatedRequest, res: Response) {
    const { name, code, percentage, is_active = true, description } = req.body;
    if (!name || percentage === undefined) {
      return res.status(422).json({ success: false, message: 'Tax name and percentage are required.' });
    }

    const newTax: Tax = {
      id: db.nextId('taxes'),
      name,
      code: code || name.toUpperCase().replace(/\s+/g, '_'),
      percentage: Number(percentage),
      is_active: Boolean(is_active),
      description,
      created_at: new Date().toISOString(),
    };

    db.taxes.push(newTax);
    db.save();

    return res.status(201).json({
      success: true,
      message: 'Tax rule created successfully',
      data: newTax,
    });
  }
}
