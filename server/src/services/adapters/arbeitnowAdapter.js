import axios from 'axios';
import { createJobHash, cleanText } from '../../utils/hash.js';
import { extractSkillsFromText } from '../../utils/skillsTaxonomy.js';
import { JOB_SOURCES } from '../../config/constants.js';
import { logger } from '../../utils/logger.js';

export class ArbeitnowAdapter {
  static get sourceName() {
    return JOB_SOURCES.ARBEITNOW;
  }

  /**
   * Fetches public jobs from Arbeitnow API
   */
  static async fetchJobs() {
    try {
      logger.info('[ArbeitnowAdapter] Fetching public tech jobs...');
      const response = await axios.get('https://www.arbeitnow.com/api/job-board-api', {
        timeout: 10000,
        headers: { 'User-Agent': 'JobPilot-AI-Sync/1.0' },
      });

      const rawJobs = response.data?.data || [];
      logger.info(`[ArbeitnowAdapter] Received ${rawJobs.length} postings.`);

      return rawJobs.slice(0, 30).map((item) => this.normalize(item)).filter(Boolean);
    } catch (error) {
      logger.warn(`[ArbeitnowAdapter] Failed to fetch: ${error.message}`);
      return [];
    }
  }

  static normalize(item) {
    if (!item.title || !item.company_name || !item.url) return null;

    const cleanedDesc = cleanText(item.description || '');
    const detectedSkills = [
      ...new Set([
        ...(item.tags || []),
        ...extractSkillsFromText(item.title + ' ' + cleanedDesc),
      ]),
    ];

    let experienceLevel = 'mid';
    const lowerTitle = item.title.toLowerCase();
    if (lowerTitle.includes('senior') || lowerTitle.includes('lead')) {
      experienceLevel = 'senior';
    } else if (lowerTitle.includes('junior') || lowerTitle.includes('entry')) {
      experienceLevel = 'entry';
    }

    let employmentType = 'full-time';
    const rawType = ((item.job_types && item.job_types[0]) || '').toLowerCase();
    if (rawType.includes('part') || rawType.includes('teilzeit')) {
      employmentType = 'part-time';
    } else if (rawType.includes('contract') || rawType.includes('freelance') || rawType.includes('freelancer')) {
      employmentType = 'contract';
    } else if (rawType.includes('intern') || rawType.includes('praktik') || rawType.includes('student')) {
      employmentType = 'internship';
    } else if (rawType.includes('full') || rawType.includes('unbefristet') || rawType.includes('arbeitsvertrag')) {
      employmentType = 'full-time';
    } else {
      employmentType = 'other';
    }

    const deduplicationHash = createJobHash(item.company_name, item.title, item.slug || item.url);

    return {
      title: item.title.trim(),
      company: item.company_name.trim(),
      location: item.location || (item.remote ? 'Remote' : 'Europe'),
      country: item.location || 'Europe',
      description: item.description,
      descriptionSnippet: cleanedDesc.slice(0, 300) + '...',
      skills: detectedSkills,
      experienceLevel,
      salary: {
        min: 0,
        max: 0,
        currency: 'EUR',
        period: 'yearly',
        raw: '',
        hasSalary: false,
      },
      employmentType,
      workMode: item.remote ? 'remote' : 'hybrid',
      postedDate: item.created_at ? new Date(item.created_at * 1000) : new Date(),
      source: JOB_SOURCES.ARBEITNOW,
      sourceId: String(item.slug || ''),
      originalUrl: item.url,
      applyUrl: item.url,
      companyLogo: '',
      deduplicationHash,
      isActive: true,
      tags: item.tags || [],
    };
  }
}
