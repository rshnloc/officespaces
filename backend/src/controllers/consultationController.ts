import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ConsultationInquiry } from '../models/types.js';

export class ConsultationController {
  public static store(req: AuthenticatedRequest, res: Response) {
    const {
      full_name,
      email,
      phone,
      company_name,
      service,
      consultation_type,
      preferred_date,
      message,
    } = req.body;

    if (!full_name || !email || !phone || !service) {
      return res.status(422).json({
        success: false,
        message: 'full_name, email, phone, and service are required.',
      });
    }

    const now = new Date().toISOString();
    const newInquiry: ConsultationInquiry = {
      id: db.nextId('consultations'),
      uuid: uuidv4(),
      full_name,
      email: email.trim().toLowerCase(),
      phone,
      company_name,
      service,
      consultation_type: consultation_type || 'Office Visit',
      preferred_date: preferred_date || now.split('T')[0],
      message,
      status: 'new',
      created_at: now,
      updated_at: now,
    };

    db.consultations.unshift(newInquiry);
    db.logAudit('create_consultation', `Inquiry received from ${newInquiry.full_name} (${newInquiry.email})`);
    db.save();

    return res.status(201).json({
      success: true,
      message: 'Consultation inquiry submitted successfully! Our workspace team will contact you shortly.',
      data: newInquiry,
    });
  }

  public static index(req: AuthenticatedRequest, res: Response) {
    const { status, service } = req.query;
    let list = db.consultations;

    if (status) {
      list = list.filter((c) => c.status === status);
    }
    if (service) {
      list = list.filter((c) => c.service === service);
    }

    list.sort((a, b) => b.created_at.localeCompare(a.created_at));

    return res.json({
      success: true,
      message: 'Consultation inquiries retrieved successfully',
      data: list,
    });
  }

  public static update(req: AuthenticatedRequest, res: Response) {
    const { consultationInquiry: inquiryId } = req.params;
    const inquiry = db.consultations.find((c) => c.id === Number(inquiryId));

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Consultation inquiry not found.' });
    }

    Object.assign(inquiry, req.body, { updated_at: new Date().toISOString() });
    db.save();

    return res.json({
      success: true,
      message: 'Consultation inquiry updated successfully',
      data: inquiry,
    });
  }
}
