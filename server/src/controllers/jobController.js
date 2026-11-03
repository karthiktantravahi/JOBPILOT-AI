import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { MatchingService } from '../services/matchingService.js';

export const getJobs = async (req, res, next) => {
  try {
    const {
      q,
      workMode,
      employmentType,
      experienceLevel,
      country,
      source,
      minSalary,
      page = 1,
      limit = 20,
      sortBy = 'latest',
    } = req.query;

    const query = { isActive: true };

    if (q) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [
        { title: regex },
        { company: regex },
        { skills: regex },
        { location: regex },
      ];
    }

    if (workMode && workMode !== 'all') {
      query.workMode = workMode;
    }

    if (employmentType && employmentType !== 'all') {
      query.employmentType = employmentType;
    }

    if (experienceLevel && experienceLevel !== 'all') {
      query.experienceLevel = experienceLevel;
    }

    if (country && country !== 'all') {
      query.country = new RegExp(country.trim(), 'i');
    }

    if (source && source !== 'all') {
      query.source = source;
    }

    if (minSalary && parseInt(minSalary, 10) > 0) {
      query['salary.max'] = { $gte: parseInt(minSalary, 10) };
    }

    const sortOptions = {};
    if (sortBy === 'latest') {
      sortOptions.postedDate = -1;
    } else if (sortBy === 'salary') {
      sortOptions['salary.max'] = -1;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const totalCount = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Calculate match score if user is logged in
    let jobsWithScores = jobs;
    if (req.user) {
      // Find existing applications for status badges
      const userApps = await Application.find({ userId: req.user._id }).select('jobId status');
      const appMap = new Map();
      userApps.forEach((a) => {
        if (a.jobId) appMap.set(a.jobId.toString(), a.status);
      });

      jobsWithScores = jobs.map((job) => {
        const jobObj = job.toObject();
        const match = MatchingService.calculateMatch(req.user, jobObj);
        return {
          ...jobObj,
          match,
          applicationStatus: appMap.get(job._id.toString()) || null,
        };
      });
    }

    res.json({
      success: true,
      data: jobsWithScores,
      pagination: {
        total: totalCount,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(totalCount / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendedJobs = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Must be logged in to view recommendations',
      });
    }

    const minScore = req.query.minScore
      ? parseInt(req.query.minScore, 10)
      : req.user.profile?.matchSettings?.minScore || 40;

    // Fetch active jobs (limit to 150 for scoring pool)
    const jobs = await Job.find({ isActive: true }).sort({ postedDate: -1 }).limit(150);

    // Get user applications for tracking badges
    const userApps = await Application.find({ userId: req.user._id }).select('jobId status');
    const appMap = new Map();
    userApps.forEach((a) => {
      if (a.jobId) appMap.set(a.jobId.toString(), a.status);
    });

    const ranked = MatchingService.rankJobsForUser(req.user, jobs, minScore).map((job) => ({
      ...job,
      applicationStatus: appMap.get(job._id.toString()) || null,
    }));

    res.json({
      success: true,
      count: ranked.length,
      data: ranked.slice(0, 50),
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    const jobObj = job.toObject();

    if (req.user) {
      jobObj.match = MatchingService.calculateMatch(req.user, jobObj);
      const app = await Application.findOne({ userId: req.user._id, jobId: job._id });
      jobObj.application = app || null;
    }

    res.json({
      success: true,
      data: jobObj,
    });
  } catch (error) {
    next(error);
  }
};
