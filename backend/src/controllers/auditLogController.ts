import { Response } from 'express';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class AuditLogController {
  public static index(req: AuthenticatedRequest, res: Response) {
    const list = db.auditLogs.slice(0, 100);
    return res.json({
      success: true,
      data: list,
    });
  }
}
