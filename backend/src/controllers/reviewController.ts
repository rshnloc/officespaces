import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Review } from '../models/types.js';

export class ReviewController {
  public static index(req: AuthenticatedRequest, res: Response) {
    const { featured, office_space_id } = req.query;
    let list = db.reviews.filter((r) => r.status === 'approved');

    if (featured === 'true' || String(featured) === 'true') {
      list = list.filter((r) => r.is_featured);
    }

    if (office_space_id) {
      list = list.filter((r) => r.office_space_id === Number(office_space_id));
    }

    return res.json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: list,
    });
  }

  public static store(req: AuthenticatedRequest, res: Response) {
    const { author_name, author_title, author_company, rating, comment, office_space_id } = req.body;

    if (!author_name || !comment || rating === undefined) {
      return res.status(422).json({
        success: false,
        message: 'author_name, rating, and comment are required.',
      });
    }

    const newReview: Review = {
      id: db.nextId('reviews'),
      uuid: uuidv4(),
      office_space_id: office_space_id ? Number(office_space_id) : null,
      customer_id: req.user ? db.customers.find((c) => c.user_id === req.user?.id)?.id || null : null,
      author_name,
      author_title,
      author_company,
      rating: Number(rating),
      comment,
      is_featured: false,
      status: 'approved',
      created_at: new Date().toISOString(),
    };

    db.reviews.unshift(newReview);
    db.save();

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Review submitted successfully.',
      data: newReview,
    });
  }

  public static update(req: AuthenticatedRequest, res: Response) {
    const { review: reviewId } = req.params;
    const review = db.reviews.find((r) => r.id === Number(reviewId));

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    Object.assign(review, req.body);
    db.save();

    return res.json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  }

  public static destroy(req: AuthenticatedRequest, res: Response) {
    const { review: reviewId } = req.params;
    const idx = db.reviews.findIndex((r) => r.id === Number(reviewId));

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    db.reviews.splice(idx, 1);
    db.save();

    return res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  }
}
