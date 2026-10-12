import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Location } from '../models/types.js';

export class LocationController {
  public static index(req: AuthenticatedRequest, res: Response) {
    const list = db.locations
      .filter((loc) => loc.status === 'active')
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((loc) => {
        const count = db.spaces.filter(
          (s) => s.location_id === loc.id && s.status === 'active'
        ).length;
        return {
          ...loc,
          office_spaces_count: count,
        };
      });

    return res.json({
      success: true,
      message: 'Locations retrieved successfully',
      data: list,
    });
  }

  public static show(req: AuthenticatedRequest, res: Response) {
    const { identifier } = req.params;
    const isNum = !isNaN(Number(identifier));

    const loc = db.locations.find(
      (l) => (isNum && l.id === Number(identifier)) || l.slug === identifier || l.uuid === identifier
    );

    if (!loc) {
      return res.status(404).json({ success: false, message: 'Location not found.' });
    }

    const count = db.spaces.filter((s) => s.location_id === loc.id && s.status === 'active').length;
    return res.json({
      success: true,
      data: {
        ...loc,
        office_spaces_count: count,
      },
    });
  }

  public static store(req: AuthenticatedRequest, res: Response) {
    const {
      name,
      slug,
      address,
      city,
      state,
      country = 'India',
      pincode,
      latitude,
      longitude,
      google_maps_url,
      contact_phone,
      contact_email,
      image,
      status = 'active',
      sort_order = 0,
    } = req.body;

    if (!name || !address || !city) {
      return res.status(422).json({
        success: false,
        message: 'Name, address, and city are required.',
      });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const now = new Date().toISOString();
    const newId = db.nextId('locations');

    const newLoc: Location = {
      id: newId,
      uuid: uuidv4(),
      name,
      slug: generatedSlug,
      address,
      city,
      state,
      country,
      pincode,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      google_maps_url,
      contact_phone,
      contact_email,
      image,
      status,
      sort_order: Number(sort_order) || 0,
      created_at: now,
      updated_at: now,
    };

    db.locations.push(newLoc);
    db.logAudit('create_location', `Created location: ${newLoc.name}`, req.user, null, newLoc);
    db.save();

    return res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: newLoc,
    });
  }

  public static update(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const loc = db.locations.find((l) => l.id === Number(id));

    if (!loc) {
      return res.status(404).json({ success: false, message: 'Location not found.' });
    }

    const oldData = { ...loc };
    Object.assign(loc, req.body, { updated_at: new Date().toISOString() });

    db.logAudit('update_location', `Updated location: ${loc.name}`, req.user, oldData, loc);
    db.save();

    return res.json({
      success: true,
      message: 'Location updated successfully',
      data: loc,
    });
  }

  public static destroy(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const idx = db.locations.findIndex((l) => l.id === Number(id));

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Location not found.' });
    }

    const [deleted] = db.locations.splice(idx, 1);
    db.logAudit('delete_location', `Deleted location: ${deleted.name}`, req.user, deleted);
    db.save();

    return res.json({
      success: true,
      message: 'Location deleted successfully',
    });
  }
}
