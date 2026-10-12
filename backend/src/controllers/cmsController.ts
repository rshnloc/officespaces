import { Response } from 'express';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class CmsController {
  public static getSections(req: AuthenticatedRequest, res: Response) {
    const { pageSlug } = req.params;
    const sections = db.cmsSections
      .filter((s) => s.page_slug === pageSlug && s.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);

    // Also return as an indexed map for easy frontend lookup
    const map: Record<string, any> = {};
    sections.forEach((s) => {
      map[s.section_key] = s;
    });

    return res.json({
      success: true,
      data: map,
    });
  }

  public static getSection(req: AuthenticatedRequest, res: Response) {
    const { pageSlug, sectionKey } = req.params;
    const section = db.cmsSections.find(
      (s) => s.page_slug === pageSlug && s.section_key === sectionKey && s.is_active
    );

    if (!section) {
      return res.status(404).json({ success: false, message: 'CMS Section not found.' });
    }

    return res.json({
      success: true,
      data: section,
    });
  }

  public static getPage(req: AuthenticatedRequest, res: Response) {
    const { slug } = req.params;
    const page = db.cmsPages.find((p) => p.slug === slug && p.is_published);

    if (!page) {
      return res.status(404).json({ success: false, message: 'CMS Page not found.' });
    }

    return res.json({
      success: true,
      data: page,
    });
  }

  public static updateSection(req: AuthenticatedRequest, res: Response) {
    const { pageSlug, sectionKey } = req.params;
    let section = db.cmsSections.find(
      (s) => s.page_slug === pageSlug && s.section_key === sectionKey
    );

    const now = new Date().toISOString();

    if (!section) {
      section = {
        id: db.nextId('cmsSections'),
        page_slug: pageSlug,
        section_key: sectionKey,
        title: req.body.title,
        subtitle: req.body.subtitle,
        data: req.body.data || {},
        is_active: req.body.is_active !== undefined ? Boolean(req.body.is_active) : true,
        sort_order: req.body.sort_order || 0,
        created_at: now,
        updated_at: now,
      };
      db.cmsSections.push(section);
    } else {
      Object.assign(section, req.body, { updated_at: now });
    }

    db.save();

    return res.json({
      success: true,
      message: 'CMS section updated successfully',
      data: section,
    });
  }
}
