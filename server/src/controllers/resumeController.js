import { ResumeParserService } from '../services/resumeParserService.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { NOTIFICATION_TYPES } from '../config/constants.js';

export const uploadAndParseResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a PDF resume.',
      });
    }

    let parsedData;
    try {
      parsedData = await ResumeParserService.parsePdf(
        req.file.buffer,
        req.file.originalname
      );
    } catch (parseErr) {
      return res.status(400).json({
        success: false,
        message: parseErr.message || 'Invalid or unreadable PDF document. Please upload a standard PDF.',
      });
    }

    // Save uploaded resume state to user document WITHOUT overwriting existing profile data
    const user = await User.findById(req.user._id);
    user.profile.resume = {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
      parsedText: parsedData.rawTextPreview,
      parsedEntities: parsedData,
    };
    await user.save();

    res.json({
      success: true,
      message: 'Resume parsed successfully. Please review and confirm the extracted data.',
      extractedData: parsedData,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmResumeExtraction = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      headline,
      bio,
      skills,
      education,
      experience,
      projects,
      certifications,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.profile.phone = phone;
    if (headline) user.profile.headline = headline;
    if (bio) user.profile.bio = bio;

    // Merge skills uniquely
    if (Array.isArray(skills)) {
      const mergedSkills = [...new Set([...(user.profile.skills || []), ...skills])];
      user.profile.skills = mergedSkills;
    }

    // Merge or replace education
    if (Array.isArray(education) && education.length > 0) {
      user.profile.education = education;
    }

    // Merge or replace experience
    if (Array.isArray(experience) && experience.length > 0) {
      user.profile.experience = experience;
    }

    if (Array.isArray(projects) && projects.length > 0) {
      user.profile.projects = projects;
    }

    if (Array.isArray(certifications) && certifications.length > 0) {
      user.profile.certifications = certifications;
    }

    await user.save();

    // In-app notification
    await Notification.create({
      userId: user._id,
      type: NOTIFICATION_TYPES.APPLICATION_UPDATE,
      title: 'Profile Updated from Resume',
      message: 'Your profile has been successfully updated with the confirmed resume details.',
      link: '/profile',
    });

    res.json({
      success: true,
      message: 'Profile successfully updated with confirmed resume data.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('profile.resume');
    res.json({
      success: true,
      resume: user.profile?.resume || null,
    });
  } catch (error) {
    next(error);
  }
};
