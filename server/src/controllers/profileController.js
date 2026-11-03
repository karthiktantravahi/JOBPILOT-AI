import { User } from '../models/User.js';

export const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      headline,
      bio,
      phone,
      location,
      education,
      experience,
      projects,
      certifications,
      skills,
      preferredJobTitles,
      preferredCountries,
      preferredCities,
      preferredWorkModes,
      preferredEmploymentTypes,
      expectedSalary,
      noticePeriod,
      visaSponsorshipRequired,
      matchSettings,
    } = req.body;

    if (name) user.name = name;

    user.profile = {
      ...user.profile.toObject(),
      ...(headline !== undefined && { headline }),
      ...(bio !== undefined && { bio }),
      ...(phone !== undefined && { phone }),
      ...(location !== undefined && { location: { ...user.profile.location, ...location } }),
      ...(education !== undefined && { education }),
      ...(experience !== undefined && { experience }),
      ...(projects !== undefined && { projects }),
      ...(certifications !== undefined && { certifications }),
      ...(skills !== undefined && { skills }),
      ...(preferredJobTitles !== undefined && { preferredJobTitles }),
      ...(preferredCountries !== undefined && { preferredCountries }),
      ...(preferredCities !== undefined && { preferredCities }),
      ...(preferredWorkModes !== undefined && { preferredWorkModes }),
      ...(preferredEmploymentTypes !== undefined && { preferredEmploymentTypes }),
      ...(expectedSalary !== undefined && { expectedSalary: { ...user.profile.expectedSalary, ...expectedSalary } }),
      ...(noticePeriod !== undefined && { noticePeriod }),
      ...(visaSponsorshipRequired !== undefined && { visaSponsorshipRequired }),
      ...(matchSettings !== undefined && {
        matchSettings: {
          ...user.profile.matchSettings,
          ...matchSettings,
          weights: {
            ...user.profile.matchSettings?.weights,
            ...matchSettings?.weights,
          },
        },
      }),
    };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMatchSettings = async (req, res, next) => {
  try {
    const { weights, minScore, enableAI } = req.body;
    const user = await User.findById(req.user._id);

    if (weights) {
      user.profile.matchSettings.weights = {
        ...user.profile.matchSettings.weights,
        ...weights,
      };
    }

    if (minScore !== undefined) {
      user.profile.matchSettings.minScore = minScore;
    }

    if (enableAI !== undefined) {
      user.profile.matchSettings.enableAI = enableAI;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Matching preferences updated.',
      matchSettings: user.profile.matchSettings,
    });
  } catch (error) {
    next(error);
  }
};
