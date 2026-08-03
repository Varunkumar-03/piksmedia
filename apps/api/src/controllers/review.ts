import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review';
import Product from '../models/Product';

// Submit a new review (Public)
export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId, userName, userEmail, rating, title, comment, media } = req.body;

    if (!productId || !userName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, name, rating, and review text are required.'
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars.'
      });
    }

    // Verify product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const newReview = await Review.create({
      productId,
      userName: userName.trim(),
      userEmail: (userEmail || '').trim(),
      rating: numericRating,
      title: (title || '').trim(),
      comment: comment.trim(),
      media: Array.isArray(media) ? media : [],
      status: 'PENDING'
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully! It will be visible once approved by our moderation team.',
      data: newReview
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit review.',
      error: error.message
    });
  }
};

// Get approved reviews for a specific product (Public)
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId, status: 'APPROVED' }).sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Number((reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews).toFixed(1))
      : 0;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const key = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      distribution[key] = (distribution[key] || 0) + 1;
    });

    return res.json({
      success: true,
      data: {
        reviews,
        stats: {
          totalReviews,
          averageRating,
          distribution
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching product reviews:', error);
    return res.json({
      success: true,
      data: {
        reviews: [],
        stats: {
          totalReviews: 0,
          averageRating: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      }
    });
  }
};

// Get all reviews for Admin moderation
export const getAdminReviews = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(String(status).toUpperCase())) {
      filter.status = String(status).toUpperCase();
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 }).lean();

    const populated = await Promise.all(
      reviews.map(async (rev: any) => {
        if (rev.productId && mongoose.isValidObjectId(rev.productId)) {
          const prod = await Product.findById(rev.productId).select('title image images price category').lean();
          return { ...rev, productId: prod || { title: rev.productId } };
        }
        return { ...rev, productId: { title: rev.productId } };
      })
    );

    return res.json({
      success: true,
      data: populated
    });
  } catch (error: any) {
    console.error('Error fetching admin reviews:', error);
    return res.json({
      success: true,
      data: []
    });
  }
};

// Update review status (Admin)
export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be APPROVED, REJECTED, or PENDING.'
      });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('productId', 'title image images price');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    return res.json({
      success: true,
      message: `Review status updated to ${status}.`,
      data: review
    });
  } catch (error: any) {
    console.error('Error updating review status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update review status.',
      error: error.message
    });
  }
};

// Delete review (Admin)
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Review deleted successfully.'
    });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete review.',
      error: error.message
    });
  }
};
