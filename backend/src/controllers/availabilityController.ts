import { Response } from 'express';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { BlockedDate } from '../models/types.js';
import { AvailabilityService } from '../services/availabilityService.js';

export class AvailabilityController {
  public static getSlots(req: AuthenticatedRequest, res: Response) {
    const { officeSpace: spaceId } = req.params;
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(422).json({ success: false, message: 'Valid date (YYYY-MM-DD) is required.' });
    }

    const space = db.spaces.find((s) => s.id === Number(spaceId) || s.slug === spaceId);
    if (!space) {
      return res.status(404).json({ success: false, message: 'Office space not found.' });
    }

    const data = AvailabilityService.getAvailableSlots(space, date);
    return res.json({
      success: true,
      data,
    });
  }

  public static checkSlot(req: AuthenticatedRequest, res: Response) {
    const { officeSpace: spaceId } = req.params;
    const { date, start_time, end_time } = req.query;

    if (!date || !start_time || !end_time) {
      return res.status(422).json({
        success: false,
        message: 'date, start_time, and end_time are required.',
      });
    }

    const space = db.spaces.find((s) => s.id === Number(spaceId) || s.slug === spaceId);
    if (!space) {
      return res.status(404).json({ success: false, message: 'Office space not found.' });
    }

    const isAvailable = AvailabilityService.isSlotAvailable(
      space,
      date as string,
      start_time as string,
      end_time as string
    );

    return res.json({
      success: true,
      data: {
        is_available: isAvailable,
        message: isAvailable ? 'Time slot is available.' : 'Time slot is occupied or unavailable.',
      },
    });
  }

  public static getMonthlyCalendar(req: AuthenticatedRequest, res: Response) {
    const { officeSpace: spaceId } = req.params;
    const now = new Date();
    const year = parseInt(req.query.year as string, 10) || now.getFullYear();
    const month = parseInt(req.query.month as string, 10) || now.getMonth() + 1;

    const space = db.spaces.find((s) => s.id === Number(spaceId) || s.slug === spaceId);
    if (!space) {
      return res.status(404).json({ success: false, message: 'Office space not found.' });
    }

    const calendar = AvailabilityService.getMonthlyCalendar(space, year, month);
    return res.json({
      success: true,
      data: calendar,
    });
  }

  public static listBlockedDates(req: AuthenticatedRequest, res: Response) {
    const { office_space_id } = req.query;
    let list = db.blockedDates;

    if (office_space_id) {
      list = list.filter((b) => b.office_space_id === Number(office_space_id));
    }

    return res.json({
      success: true,
      data: list,
    });
  }

  public static storeBlockedDate(req: AuthenticatedRequest, res: Response) {
    const { office_space_id, blocked_date, start_time, end_time, reason } = req.body;

    if (!blocked_date) {
      return res.status(422).json({ success: false, message: 'blocked_date is required.' });
    }

    const newBlocked: BlockedDate = {
      id: db.nextId('blockedDates'),
      office_space_id: office_space_id ? Number(office_space_id) : null,
      blocked_date,
      start_time: start_time || null,
      end_time: end_time || null,
      reason,
      created_at: new Date().toISOString(),
    };

    db.blockedDates.push(newBlocked);
    db.save();

    return res.status(201).json({
      success: true,
      message: 'Blocked date created successfully',
      data: newBlocked,
    });
  }

  public static destroyBlockedDate(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const idx = db.blockedDates.findIndex((b) => b.id === Number(id));

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Blocked date record not found.' });
    }

    db.blockedDates.splice(idx, 1);
    db.save();

    return res.json({
      success: true,
      message: 'Blocked date deleted successfully',
    });
  }
}
