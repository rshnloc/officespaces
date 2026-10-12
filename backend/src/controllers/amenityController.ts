import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Amenity } from '../models/types.js';

export class AmenityController {
  public static index(req: AuthenticatedRequest, res: Response) {
    const list = db.amenities.filter((a) => a.status === 'active');
    return res.json({
      success: true,
      message: 'Amenities retrieved successfully',
      data: list,
    });
  }

  public static store(req: AuthenticatedRequest, res: Response) {
    const { name, slug, icon, description, status = 'active' } = req.body;

    if (!name) {
      return res.status(422).json({ success: false, message: 'Amenity name is required.' });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const now = new Date().toISOString();
    const newAmenity: Amenity = {
      id: db.nextId('amenities'),
      uuid: uuidv4(),
      name,
      slug: generatedSlug,
      icon,
      description,
      status,
      created_at: now,
      updated_at: now,
    };

    db.amenities.push(newAmenity);
    db.logAudit('create_amenity', `Created amenity: ${newAmenity.name}`, req.user, null, newAmenity);
    db.save();

    return res.status(201).json({
      success: true,
      message: 'Amenity created successfully',
      data: newAmenity,
    });
  }

  public static update(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const amenity = db.amenities.find((a) => a.id === Number(id));

    if (!amenity) {
      return res.status(404).json({ success: false, message: 'Amenity not found.' });
    }

    Object.assign(amenity, req.body, { updated_at: new Date().toISOString() });
    db.save();

    return res.json({
      success: true,
      message: 'Amenity updated successfully',
      data: amenity,
    });
  }

  public static destroy(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const idx = db.amenities.findIndex((a) => a.id === Number(id));

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Amenity not found.' });
    }

    db.amenities.splice(idx, 1);
    db.save();

    return res.json({
      success: true,
      message: 'Amenity deleted successfully',
    });
  }
}
