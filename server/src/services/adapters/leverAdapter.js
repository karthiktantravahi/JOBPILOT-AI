import axios from 'axios';
import { createJobHash, cleanText } from '../../utils/hash.js';
import { extractSkillsFromText } from '../../utils/skillsTaxonomy.js';
import { JOB_SOURCES } from '../../config/constants.js';
import { logger } from '../../utils/logger.js';

export class LeverAdapter {
  static get sourceName() {
    return JOB_SOURCES.LEVER;
  }

  static defaultCompanies = ['kinsta', 'deliveroo', 'automattic'];

  /**
   * Fetches public postings from Lever API
   * @param {string[]} companies
   */
  static async fetchJobs(companies = this.defaultCompanies) {
    const allJobs = [];

    for (const company of companies) {
      try {
        logger.info(`[LeverAdapter] Fetching company: ${company}...`);
        const url = `https://api.lever.co/v0/postings/${company}?mode=json`;
        const response = await axios.get(url, {
          timeout: 10000,
          headers: { 'User-Agent': 'JobPilot-AI-Sync/1.0' },
        });

        const rawJobs = response.data || [];
        logger.info(`[LeverAdapter] ${company} returned ${rawJobs.length} postings.`);

        for (const item of rawJobs.slice(0, 20)) {
          const normalized = this.normalize(item, company);
          if (normalized) allJobs.push(normalized);
        }
      } catch (error) {
        logger.warn(`[LeverAdapter] Could not fetch postings for ${company}: ${error.message}`);
      }
    }

    return allJobs;
  }

  static normalize(item, companySlug) {
    if (!item.text || !item.hostedUrl) return null;

    const companyName = companySlug.charAt(0).toUpperCase() + companySlug.slice(1);
    const descriptionPlain = item.descriptionPlain || '';
    const locationName = item.categories?.location || 'Remote';

    let workMode = 'onsite';
    const lowerLoc = locationName.toLowerCase();
    if (item.workplaceType === 'remote' || lowerLoc.includes('remote') || lowerLoc.includes('anywhere')) {
      workMode = 'remote';
    } else if (item.workplaceType === 'hybrid' || lowerLoc.includes('hybrid')) {
      workMode = 'hybrid';
    }

    const detectedSkills = extractSkillsFromText(item.text + ' ' + descriptionPlain);

    let experienceLevel = 'mid';
    const lowerTitle = item.text.toLowerCase();
    if (lowerTitle.includes('senior') || lowerTitle.includes('lead') || lowerTitle.includes('staff')) {
      experienceLevel = 'senior';
    } else if (lowerTitle.includes('junior') || lowerTitle.includes('entry') || lowerTitle.includes('intern')) {
      experienceLevel = 'entry';
    } else if (lowerTitle.includes('director') || lowerTitle.includes('head')) {
      experienceLevel = 'director';
    }

    // Salary parsing if present in salaryDescription or lists
    let salaryMin = 0;
    let salaryMax = 0;
    let hasSalary = false;
    let rawSalary = '';
    if (item.salaryDescription) {
      hasSalary = true;
      rawSalary = item.salaryDescription;
      const numbers = rawSalary.match(/\d+[\d,]*/g);
      if (numbers && numbers.length >= 2) {
        salaryMin = parseInt(numbers[0].replace(/,/g, ''), 10);
        salaryMax = parseInt(numbers[1].replace(/,/g, ''), 10);
      }
    }

    const deduplicationHash = createJobHash(companyName, item.text, String(item.id || item.hostedUrl));

    return {
      title: item.text.trim(),
      company: companyName,
      location: locationName,
      country: locationName.includes(',') ? locationName.split(',').pop().trim() : locationName,
      description: item.description || descriptionPlain || `${item.text} at ${companyName}`,
      descriptionSnippet: (cleanText(descriptionPlain).slice(0, 300) || `${item.text} at ${companyName}`) + '...',
      skills: detectedSkills,
      experienceLevel,
      salary: {
        min: salaryMin,
        max: salaryMax,
        currency: 'USD',
        period: 'yearly',
        raw: rawSalary,
        hasSalary,
      },
      employmentType: (item.categories?.commitment || 'Full-time').toLowerCase().includes('contract') ? 'contract' : 'full-time',
      workMode,
      postedDate: item.createdAt ? new Date(item.createdAt) : new Date(),
      source: JOB_SOURCES.LEVER,
      sourceId: String(item.id),
      originalUrl: item.hostedUrl,
      applyUrl: item.applyUrl || item.hostedUrl,
      companyLogo: '',
      deduplicationHash,
      isActive: true,
      tags: [item.categories?.team, workMode].filter(Boolean),
    };
  }
}
