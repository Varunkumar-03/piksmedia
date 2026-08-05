import { Request, Response } from 'express';
import Visitor from '../models/Visitor';

export const recordHit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      res.status(400).json({ success: false, error: 'Session ID is required' });
      return;
    }

    // Upsert visitor session
    const visitor = await Visitor.findOneAndUpdate(
      { sessionId },
      { $setOnInsert: { hasPurchased: false } },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: visitor });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getVisitorStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalVisitors = await Visitor.countDocuments();
    const totalBuyers = await Visitor.countDocuments({ hasPurchased: true });

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyBounces = await Visitor.countDocuments({
      hasPurchased: false,
      createdAt: { $gte: oneWeekAgo }
    });

    const monthlyBounces = await Visitor.countDocuments({
      hasPurchased: false,
      createdAt: { $gte: oneMonthAgo }
    });

    const weeklyTotal = await Visitor.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    const monthlyTotal = await Visitor.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalVisitors,
        totalBuyers,
        weeklyBounces,
        monthlyBounces,
        weeklyTotal,
        monthlyTotal,
        weeklyConversionRate: weeklyTotal > 0 ? (((weeklyTotal - weeklyBounces) / weeklyTotal) * 100).toFixed(1) : '0.0',
        monthlyConversionRate: monthlyTotal > 0 ? (((monthlyTotal - monthlyBounces) / monthlyTotal) * 100).toFixed(1) : '0.0'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
