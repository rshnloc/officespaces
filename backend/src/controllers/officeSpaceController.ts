import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { OfficeSpace, OfficeSpaceImage } from '../models/types.js';

export class OfficeSpaceController {
  public static index(req: AuthenticatedRequest, res: Response) {
    const {
      location_id,
      location_slug,
      space_type,
      capacity,
      min_price,
      max_price,
      pricing_unit,
      is_featured,
      amenities,
      search,
      sort_by = 'featured',
      page = 1,
      per_page = 12,
      status,
    } = req.query;

    const isAdmin = req.user && ['super_admin', 'admin', 'manager'].includes(req.user.role);

    let list = db.spaces.map((s) => db.populateSpace(s));

    // Status filter
    if (!isAdmin) {
      list = list.filter((s) => s.status === 'active');
    } else if (status) {
      list = list.filter((s) => s.status === status);
    }

    // Location filter
    if (location_id) {
      list = list.filter((s) => s.location_id === Number(location_id));
    } else if (location_slug) {
      const loc = db.locations.find((l) => l.slug === location_slug);
      if (loc) {
        list = list.filter((s) => s.location_id === loc.id);
      } else {
        list = [];
      }
    }

    // Space type filter
    if (space_type) {
      const types = typeof space_type === 'string' ? space_type.split(',') : (space_type as string[]);
      list = list.filter((s) => types.includes(s.space_type));
    }

    // Capacity filter
    if (capacity) {
      list = list.filter((s) => s.capacity >= Number(capacity));
    }

    // Price range
    if (min_price) {
      list = list.filter((s) => s.base_price >= Number(min_price));
    }
    if (max_price) {
      list = list.filter((s) => s.base_price <= Number(max_price));
    }

    // Pricing unit
    if (pricing_unit) {
      list = list.filter((s) => s.pricing_unit === pricing_unit);
    }

    // Featured
    if (is_featured === 'true' || String(is_featured) === 'true') {
      list = list.filter((s) => s.is_featured);
    }

    // Amenities filter
    if (amenities) {
      const amenityIds = (typeof amenities === 'string' ? amenities.split(',') : (amenities as string[])).map(
        (a) => {
          const num = Number(a);
          if (!isNaN(num)) return num;
          const found = db.amenities.find((item) => item.slug === a);
          return found ? found.id : null;
        }
      ).filter(Boolean) as number[];

      if (amenityIds.length > 0) {
        list = list.filter((s) =>
          amenityIds.every((aid) => s.amenity_ids.includes(aid))
        );
      }
    }

    // Search keyword
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter((s) => {
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesDesc = s.description?.toLowerCase().includes(q) || false;
        const matchesBuilding = s.building?.toLowerCase().includes(q) || false;
        const matchesCity = s.location?.city.toLowerCase().includes(q) || false;
        const matchesLocName = s.location?.name.toLowerCase().includes(q) || false;
        return matchesName || matchesDesc || matchesBuilding || matchesCity || matchesLocName;
      });
    }

    // Sorting
    switch (sort_by) {
      case 'price_asc':
        list.sort((a, b) => a.base_price - b.base_price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.base_price - a.base_price);
        break;
      case 'capacity_asc':
        list.sort((a, b) => a.capacity - b.capacity);
        break;
      case 'capacity_desc':
        list.sort((a, b) => b.capacity - a.capacity);
        break;
      case 'newest':
        list.sort((a, b) => b.created_at.localeCompare(a.created_at));
        break;
      default:
        list.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return a.sort_order - b.sort_order;
        });
        break;
    }

    // Pagination
    const pageNum = Math.max(1, Number(page) || 1);
    const limit = Math.min(50, Math.max(1, Number(per_page) || 12));
    const total = list.length;
    const startIndex = (pageNum - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return res.json({
      success: true,
      message: 'Office spaces retrieved successfully',
      data: paginated,
      meta: {
        current_page: pageNum,
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit) || 1,
      },
    });
  }

  public static show(req: AuthenticatedRequest, res: Response) {
    const { identifier } = req.params;
    const isNum = !isNaN(Number(identifier));

    const space = db.spaces.find(
      (s) => (isNum && s.id === Number(identifier)) || s.slug === identifier || s.uuid === identifier
    );

    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Office space not found.',
      });
    }

    return res.json({
      success: true,
      data: db.populateSpace(space),
    });
  }

  public static store(req: AuthenticatedRequest, res: Response) {
    const {
      location_id,
      name,
      slug,
      space_type,
      description,
      short_description,
      capacity,
      building,
      floor,
      area_sqft,
      base_price,
      pricing_unit = 'hourly',
      weekend_price,
      holiday_price,
      currency = 'INR',
      status = 'active',
      is_featured = false,
      terms,
      cancellation_policy,
      sort_order = 0,
      amenities = [],
      images = [],
    } = req.body;

    if (!location_id || !name || !space_type || base_price === undefined) {
      return res.status(422).json({
        success: false,
        message: 'location_id, name, space_type, and base_price are required.',
      });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const now = new Date().toISOString();
    const newId = db.nextId('spaces');

    const newSpace: OfficeSpace = {
      id: newId,
      uuid: uuidv4(),
      location_id: Number(location_id),
      name,
      slug: generatedSlug,
      space_type,
      description,
      short_description,
      capacity: Number(capacity) || 1,
      building,
      floor,
      area_sqft: area_sqft ? Number(area_sqft) : undefined,
      base_price: Number(base_price),
      pricing_unit,
      weekend_price: weekend_price ? Number(weekend_price) : undefined,
      holiday_price: holiday_price ? Number(holiday_price) : undefined,
      currency,
      status,
      is_featured: Boolean(is_featured),
      terms,
      cancellation_policy,
      sort_order: Number(sort_order) || 0,
      amenity_ids: Array.isArray(amenities) ? amenities.map(Number) : [],
      created_at: now,
      updated_at: now,
    };

    db.spaces.push(newSpace);

    // Add images if provided
    if (Array.isArray(images)) {
      images.forEach((imgUrl: string, idx: number) => {
        db.images.push({
          id: db.nextId('images'),
          uuid: uuidv4(),
          office_space_id: newSpace.id,
          image_path: imgUrl,
          url: imgUrl,
          is_primary: idx === 0,
          sort_order: idx,
          created_at: now,
        });
      });
    }

    // Default pricing rule
    db.pricingRules.push({
      id: db.nextId('pricingRules'),
      office_space_id: newSpace.id,
      pricing_unit,
      base_price: Number(base_price),
      weekend_price: weekend_price ? Number(weekend_price) : undefined,
      holiday_price: holiday_price ? Number(holiday_price) : undefined,
      minimum_hours: 1,
      currency,
      is_active: true,
      created_at: now,
    });

    db.logAudit('create_space', `Created office space: ${newSpace.name}`, req.user, null, newSpace);
    db.save();

    return res.status(201).json({
      success: true,
      message: 'Office space created successfully',
      data: db.populateSpace(newSpace),
    });
  }

  public static update(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const space = db.spaces.find((s) => s.id === Number(id));

    if (!space) {
      return res.status(404).json({ success: false, message: 'Office space not found.' });
    }

    const oldData = { ...space };
    const allowed = [
      'location_id',
      'name',
      'slug',
      'space_type',
      'description',
      'short_description',
      'capacity',
      'building',
      'floor',
      'area_sqft',
      'base_price',
      'pricing_unit',
      'weekend_price',
      'holiday_price',
      'currency',
      'status',
      'is_featured',
      'terms',
      'cancellation_policy',
      'sort_order',
    ];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (space as any)[key] = req.body[key];
      }
    }

    if (Array.isArray(req.body.amenities)) {
      space.amenity_ids = req.body.amenities.map(Number);
    }

    space.updated_at = new Date().toISOString();

    db.logAudit('update_space', `Updated office space: ${space.name}`, req.user, oldData, space);
    db.save();

    return res.json({
      success: true,
      message: 'Office space updated successfully',
      data: db.populateSpace(space),
    });
  }

  public static destroy(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const index = db.spaces.findIndex((s) => s.id === Number(id));

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Office space not found.' });
    }

    const [deleted] = db.spaces.splice(index, 1);
    db.logAudit('delete_space', `Deleted office space #${id}: ${deleted.name}`, req.user, deleted);
    db.save();

    return res.json({
      success: true,
      message: 'Office space deleted successfully',
    });
  }

  public static uploadImage(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { image_path, url, is_primary = false, caption } = req.body;
    const imgUrl = url || image_path;

    if (!imgUrl) {
      return res.status(422).json({ success: false, message: 'Image URL is required.' });
    }

    const space = db.spaces.find((s) => s.id === Number(id));
    if (!space) {
      return res.status(404).json({ success: false, message: 'Office space not found.' });
    }

    const now = new Date().toISOString();
    const newImage: OfficeSpaceImage = {
      id: db.nextId('images'),
      uuid: uuidv4(),
      office_space_id: space.id,
      image_path: imgUrl,
      url: imgUrl,
      caption,
      is_primary: Boolean(is_primary),
      sort_order: db.images.filter((i) => i.office_space_id === space.id).length,
      created_at: now,
    };

    if (newImage.is_primary) {
      db.images
        .filter((i) => i.office_space_id === space.id)
        .forEach((i) => (i.is_primary = false));
    }

    db.images.push(newImage);
    db.save();

    return res.status(201).json({
      success: true,
      message: 'Image added successfully',
      data: newImage,
    });
  }

  public static deleteImage(req: AuthenticatedRequest, res: Response) {
    const { id, image: imageId } = req.params;
    const idx = db.images.findIndex(
      (img) => img.office_space_id === Number(id) && (img.id === Number(imageId) || img.uuid === imageId)
    );

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }

    db.images.splice(idx, 1);
    db.save();

    return res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  }
}
