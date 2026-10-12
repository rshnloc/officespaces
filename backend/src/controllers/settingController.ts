import { Response } from 'express';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class SettingController {
  public static getPublicSettings(req: AuthenticatedRequest, res: Response) {
    const publicSettings = db.settings.filter((s) => s.is_public);
    const map: Record<string, string> = {};
    publicSettings.forEach((s) => {
      map[s.key] = s.value;
    });

    return res.json({
      success: true,
      data: map,
    });
  }

  public static adminIndex(req: AuthenticatedRequest, res: Response) {
    return res.json({
      success: true,
      data: db.settings,
    });
  }

  public static updateBatch(req: AuthenticatedRequest, res: Response) {
    const { settings } = req.body; // array of { key, value } or object of { key: value }

    if (!settings) {
      return res.status(422).json({ success: false, message: 'Settings payload is required.' });
    }

    const now = new Date().toISOString();

    if (Array.isArray(settings)) {
      settings.forEach((item: { key: string; value: string; group?: string }) => {
        let existing = db.settings.find((s) => s.key === item.key);
        if (existing) {
          existing.value = String(item.value);
          existing.updated_at = now;
        } else {
          db.settings.push({
            id: db.nextId('settings'),
            key: item.key,
            value: String(item.value),
            group: item.group || 'general',
            type: 'string',
            is_public: true,
            created_at: now,
            updated_at: now,
          });
        }
      });
    } else if (typeof settings === 'object') {
      Object.entries(settings).forEach(([key, value]) => {
        let existing = db.settings.find((s) => s.key === key);
        if (existing) {
          existing.value = String(value);
          existing.updated_at = now;
        } else {
          db.settings.push({
            id: db.nextId('settings'),
            key,
            value: String(value),
            group: 'general',
            type: 'string',
            is_public: true,
            created_at: now,
            updated_at: now,
          });
        }
      });
    }

    db.save();

    return res.json({
      success: true,
      message: 'Settings updated successfully',
      data: db.settings,
    });
  }
}
