export const DEFAULT_WEIGHTS = {
  skills: 0.35,
  experience: 0.20,
  title: 0.15,
  education: 0.10,
  location: 0.10,
  employmentType: 0.05,
  salary: 0.05,
};

/**
 * Computes explainable match score between a user profile and a job
 */
export const calculateClientMatch = (userProfile = {}, job = {}, customWeights = {}) => {
  const profile = userProfile.profile || userProfile;
  const weights = {
    skills: customWeights.skills ?? profile.matchSettings?.weights?.skills ?? DEFAULT_WEIGHTS.skills,
    experience: customWeights.experience ?? profile.matchSettings?.weights?.experience ?? DEFAULT_WEIGHTS.experience,
    title: customWeights.title ?? profile.matchSettings?.weights?.title ?? DEFAULT_WEIGHTS.title,
    education: customWeights.education ?? profile.matchSettings?.weights?.education ?? DEFAULT_WEIGHTS.education,
    location: customWeights.location ?? profile.matchSettings?.weights?.location ?? DEFAULT_WEIGHTS.location,
    employmentType: customWeights.employmentType ?? profile.matchSettings?.weights?.employmentType ?? DEFAULT_WEIGHTS.employmentType,
    salary: customWeights.salary ?? profile.matchSettings?.weights?.salary ?? DEFAULT_WEIGHTS.salary,
  };

  const reasons = [];

  // 1. Skill Score (35%)
  const userSkills = (profile.skills || []).map((s) => s.toLowerCase().trim());
  const jobSkills = (job.skills || []).map((s) => s.toLowerCase().trim());

  const matchedSkills = [];
  const missingSkills = [];

  for (const jSkill of jobSkills) {
    if (userSkills.some((uSkill) => uSkill === jSkill || uSkill.includes(jSkill) || jSkill.includes(uSkill))) {
      matchedSkills.push(jSkill);
    } else {
      missingSkills.push(jSkill);
    }
  }

  let skillScore = 0.5;
  if (jobSkills.length > 0) {
    skillScore = matchedSkills.length / jobSkills.length;
    if (matchedSkills.length > 0) {
      reasons.push(`Matched ${matchedSkills.length} key skill(s): ${matchedSkills.slice(0, 3).join(', ')}${matchedSkills.length > 3 ? '...' : ''}`);
    }
    if (missingSkills.length > 0) {
      reasons.push(`Missing: ${missingSkills.slice(0, 3).join(', ')}`);
    }
  } else {
    const descLower = (job.descriptionSnippet || job.description || '').toLowerCase();
    const inTextMatches = userSkills.filter((s) => descLower.includes(s));
    skillScore = Math.min(inTextMatches.length / Math.max(userSkills.length, 4), 1);
    if (inTextMatches.length > 0) {
      reasons.push(`Job mentions ${inTextMatches.length} of your listed competencies.`);
    }
  }

  // 2. Experience Score (20%)
  const userExpCount = (profile.experience || []).length;
  let expScore = 0.7;
  const jobLevel = (job.experienceLevel || 'mid').toLowerCase();

  if (jobLevel === 'entry') {
    expScore = userExpCount <= 2 ? 1.0 : 0.85;
    reasons.push('Entry-level criteria matches early career stage.');
  } else if (jobLevel === 'senior' || jobLevel === 'lead') {
    if (userExpCount >= 3) {
      expScore = 0.95;
      reasons.push('Demonstrated career history matches senior requirements.');
    } else if (userExpCount >= 1) {
      expScore = 0.65;
      reasons.push('Senior requirements may challenge current years of formal history.');
    } else {
      expScore = 0.40;
    }
  } else {
    expScore = userExpCount >= 1 ? 0.90 : 0.70;
    reasons.push('Mid-level requirements align well with profile background.');
  }

  // 3. Title Score (15%)
  const preferredTitles = (profile.preferredJobTitles || []).map((t) => t.toLowerCase());
  const pastTitles = (profile.experience || []).map((e) => (e.title || '').toLowerCase());
  const allUserTitles = [...preferredTitles, ...pastTitles];
  const jobTitleLower = (job.title || '').toLowerCase();

  let titleScore = 0.3;
  let titleMatched = false;

  for (const title of allUserTitles) {
    if (!title) continue;
    if (jobTitleLower.includes(title) || title.includes(jobTitleLower)) {
      titleScore = 1.0;
      titleMatched = true;
      reasons.push(`Role title matches your focus in "${title}".`);
      break;
    }
    const titleWords = title.split(/\s+/).filter((w) => w.length > 3);
    const matchingWords = titleWords.filter((w) => jobTitleLower.includes(w));
    if (matchingWords.length > 0) {
      const overlapRatio = matchingWords.length / titleWords.length;
      if (overlapRatio > titleScore) {
        titleScore = Math.max(0.6, overlapRatio * 0.9);
      }
    }
  }

  // 4. Education Score (10%)
  let eduScore = 0.8;
  const userEdu = profile.education || [];
  if (userEdu.length > 0) {
    eduScore = 0.95;
    reasons.push(`${userEdu[0].degree || 'Degree'} satisfies typical requirements.`);
  }

  // 5. Location Score (10%)
  let locScore = 0.6;
  const userWorkModes = profile.preferredWorkModes || ['remote'];
  const jobWorkMode = (job.workMode || 'remote').toLowerCase();

  if (userWorkModes.includes(jobWorkMode)) {
    locScore = 1.0;
    reasons.push(`Work mode (${jobWorkMode}) is an exact match.`);
  } else if (jobWorkMode === 'remote') {
    locScore = 0.95;
    reasons.push('Remote flexibility offers full location compatibility.');
  }

  // 6. Employment Type Score (5%)
  let empScore = 0.8;
  const userEmpTypes = profile.preferredEmploymentTypes || ['full-time'];
  const jobEmpType = (job.employmentType || 'full-time').toLowerCase();
  if (userEmpTypes.includes(jobEmpType)) {
    empScore = 1.0;
  }

  // 7. Salary Score (5%)
  let salScore = 0.7;
  const expectedSalary = profile.expectedSalary || {};
  if (job.salary?.hasSalary && expectedSalary.min > 0) {
    if (job.salary.max >= expectedSalary.min) {
      salScore = 1.0;
      reasons.push('Compensation meets your expected threshold.');
    } else {
      salScore = 0.4;
      reasons.push(`Max compensation ($${job.salary.max.toLocaleString()}) is below target.`);
    }
  } else {
    reasons.push('Compensation not published by employer.');
  }

  const totalWeight =
    weights.skills +
    weights.experience +
    weights.title +
    weights.education +
    weights.location +
    weights.employmentType +
    weights.salary;

  const weightedScore =
    (skillScore * weights.skills +
      expScore * weights.experience +
      titleScore * weights.title +
      eduScore * weights.education +
      locScore * weights.location +
      empScore * weights.employmentType +
      salScore * weights.salary) /
    (totalWeight || 1.0);

  const matchPercentage = Math.min(Math.max(Math.round(weightedScore * 100), 10), 99);

  return {
    matchPercentage,
    matchedSkills: matchedSkills.slice(0, 8),
    missingSkills: missingSkills.slice(0, 8),
    scoreBreakdown: {
      skills: Math.round(skillScore * 100),
      experience: Math.round(expScore * 100),
      title: Math.round(titleScore * 100),
      education: Math.round(eduScore * 100),
      location: Math.round(locScore * 100),
      employmentType: Math.round(empScore * 100),
      salary: Math.round(salScore * 100),
    },
    weights,
    reasons: reasons.slice(0, 5),
  };
};
