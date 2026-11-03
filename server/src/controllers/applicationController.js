import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { MatchingService } from '../services/matchingService.js';
import { Notification } from '../models/Notification.js';
import { NOTIFICATION_TYPES } from '../config/constants.js';

export const getApplications = async (req, res, next) => {
  try {
    const { status, sortBy = 'updatedAt' } = req.query;
    const query = { userId: req.user._id };

    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }

    const sortOptions = {};
    if (sortBy === 'appliedDate') {
      sortOptions.appliedDate = -1;
    } else if (sortBy === 'interviewDate') {
      sortOptions.interviewDate = 1;
    } else {
      sortOptions.updatedAt = -1;
    }

    const applications = await Application.find(query).sort(sortOptions);

    res.json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req, res, next) => {
  try {
    const {
      jobId,
      company,
      jobTitle,
      location,
      workMode,
      salary,
      originalUrl,
      source,
      status = 'SAVED',
      appliedDate,
      interviewDate,
      notes,
    } = req.body;

    // Check if user already tracked this job
    if (jobId) {
      const existing = await Application.findOne({ userId: req.user._id, jobId });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You have already added this job to your tracker.',
          application: existing,
        });
      }
    }

    // Compute match score snapshot if jobId is present
    let matchScore = null;
    let matchBreakdown = null;
    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) {
        const match = MatchingService.calculateMatch(req.user, job);
        matchScore = match.matchPercentage;
        matchBreakdown = match;
      }
    }

    const application = await Application.create({
      userId: req.user._id,
      jobId: jobId || null,
      company,
      jobTitle,
      location: location || 'Remote',
      workMode: workMode || 'remote',
      salary: salary || '',
      originalUrl: originalUrl || '',
      source: source || 'JobPilot',
      status: status.toUpperCase(),
      appliedDate: appliedDate ? new Date(appliedDate) : status === 'APPLIED' ? new Date() : null,
      interviewDate: interviewDate ? new Date(interviewDate) : null,
      notes: notes ? [{ text: notes, createdAt: new Date() }] : [],
      matchScore,
      matchBreakdown,
      timeline: [
        {
          status: status.toUpperCase(),
          changedAt: new Date(),
          note: 'Application record initiated',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Application added to tracker successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const oldStatus = application.status;
    application.status = status.toUpperCase();

    // If moving to APPLIED and appliedDate is unset
    if (status.toUpperCase() === 'APPLIED' && !application.appliedDate) {
      application.appliedDate = new Date();
    }

    application.timeline.push({
      status: status.toUpperCase(),
      changedAt: new Date(),
      note: note || `Status changed from ${oldStatus} to ${status.toUpperCase()}`,
    });

    await application.save();

    // Notify user if status is INTERVIEW or OFFER
    if (status.toUpperCase() === 'INTERVIEW') {
      await Notification.create({
        userId: req.user._id,
        type: NOTIFICATION_TYPES.INTERVIEW_REMINDER,
        title: 'Interview Stage Reached!',
        message: `Congratulations! Your application for ${application.jobTitle} at ${application.company} is in Interview stage. Prepare your questions!`,
        link: '/applications',
      });
    }

    res.json({
      success: true,
      message: `Status updated to ${status}.`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const {
      company,
      jobTitle,
      location,
      workMode,
      salary,
      originalUrl,
      appliedDate,
      interviewDate,
      offerDetails,
      isFavorite,
    } = req.body;

    if (company) application.company = company;
    if (jobTitle) application.jobTitle = jobTitle;
    if (location) application.location = location;
    if (workMode) application.workMode = workMode;
    if (salary !== undefined) application.salary = salary;
    if (originalUrl !== undefined) application.originalUrl = originalUrl;
    if (appliedDate !== undefined) application.appliedDate = appliedDate ? new Date(appliedDate) : null;
    if (interviewDate !== undefined) application.interviewDate = interviewDate ? new Date(interviewDate) : null;
    if (offerDetails !== undefined) application.offerDetails = offerDetails;
    if (isFavorite !== undefined) application.isFavorite = isFavorite;

    await application.save();

    res.json({
      success: true,
      message: 'Application updated successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const addNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Note text cannot be empty.' });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.notes.push({ text: text.trim(), createdAt: new Date() });
    await application.save();

    res.json({
      success: true,
      message: 'Note added successfully.',
      notes: application.notes,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.json({
      success: true,
      message: 'Application removed from tracker.',
    });
  } catch (error) {
    next(error);
  }
};
