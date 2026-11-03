import mongoose from 'mongoose';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Status Counts
    const statusCounts = await Application.aggregate([
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const counts = {
      SAVED: 0,
      APPLIED: 0,
      ASSESSMENT: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    };

    statusCounts.forEach((item) => {
      if (counts[item._id] !== undefined) {
        counts[item._id] = item.count;
      }
    });

    const totalTracked = Object.values(counts).reduce((a, b) => a + b, 0);
    const activeApplications =
      counts.APPLIED + counts.ASSESSMENT + counts.INTERVIEW + counts.OFFER;
    const totalOutreach = activeApplications + counts.REJECTED;

    const successRate = totalOutreach > 0 ? Math.round((counts.OFFER / totalOutreach) * 100) : 0;
    const interviewRate = totalOutreach > 0 ? Math.round((counts.INTERVIEW / totalOutreach) * 100) : 0;

    // 2. Source Distribution
    const sourceStats = await Application.aggregate([
      { $match: { userId } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 3. Weekly Application Activity (Last 8 Weeks)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const weeklyActivityRaw = await Application.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: eightWeeksAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    // Format weekly activity
    const weeklyActivity = weeklyActivityRaw.map((w, idx) => ({
      week: `Week ${idx + 1}`,
      count: w.count,
    }));

    // If empty, generate past 4 weeks with 0
    if (weeklyActivity.length === 0) {
      weeklyActivity.push(
        { week: 'Week 1', count: 0 },
        { week: 'Week 2', count: 0 },
        { week: 'Week 3', count: 0 },
        { week: 'Week 4', count: totalTracked }
      );
    }

    // 4. Average Match Score of Saved / Applied Jobs
    const scoreStats = await Application.aggregate([
      { $match: { userId, matchScore: { $ne: null } } },
      { $group: { _id: null, avgScore: { $avg: '$matchScore' } } },
    ]);

    const avgMatchScore = scoreStats[0]?.avgScore ? Math.round(scoreStats[0].avgScore) : null;

    // 5. Global platform stats for benchmark
    const totalGlobalJobs = await Job.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        counts,
        totalTracked,
        totalSaved: counts.SAVED,
        totalApplied: counts.APPLIED,
        interviews: counts.INTERVIEW,
        offers: counts.OFFER,
        rejections: counts.REJECTED,
        successRate,
        interviewRate,
        avgMatchScore,
        sourceDistribution: sourceStats.map((s) => ({
          name: s._id || 'Direct',
          count: s.count,
        })),
        weeklyActivity,
        platformMetrics: {
          totalGlobalJobs,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
