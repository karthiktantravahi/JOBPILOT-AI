import axios from 'axios';
import { createJobHash, cleanText } from '../../utils/hash.js';
import { extractSkillsFromText } from '../../utils/skillsTaxonomy.js';
import { JOB_SOURCES } from '../../config/constants.js';
import { logger } from '../../utils/logger.js';

export class RemotiveAdapter {
  static get sourceName() {
    return JOB_SOURCES.REMOTIVE;
  }

  /**
   * Fetches real public remote jobs from Remotive API
   * @param {number} limit
   */
  static async fetchJobs(limit = 30) {
    try {
      logger.info(`[RemotiveAdapter] Fetching latest jobs (limit: ${limit})...`);
      const response = await axios.get(`https://remotive.com/api/remote-jobs?limit=${limit}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'JobPilot-AI-Sync/1.0',
          Accept: 'application/json',
        },
      });

      const rawJobs = response.data?.jobs || [];
      logger.info(`[RemotiveAdapter] Received ${rawJobs.length} jobs.`);

      return rawJobs.map((item) => this.normalize(item)).filter(Boolean);
    } catch (error) {
      logger.error(`[RemotiveAdapter] Failed to fetch jobs: ${error.message}`);
      return [];
    }
  }

  static normalize(item) {
    if (!item.title || !item.company_name || !item.url) {
      return null;
    }

    const cleanedDesc = cleanText(item.description || '');
    const detectedSkills = [
      ...new Set([
        ...(item.tags || []),
        ...extractSkillsFromText(item.title + ' ' + cleanedDesc),
      ]),
    ];

    // Detect experience level
    let experienceLevel = 'mid';
    const lowerTitle = item.title.toLowerCase();
    if (lowerTitle.includes('senior') || lowerTitle.includes('sr.') || lowerTitle.includes('lead')) {
      experienceLevel = 'senior';
    } else if (lowerTitle.includes('junior') || lowerTitle.includes('entry') || lowerTitle.includes('associate')) {
      experienceLevel = 'entry';
    } else if (lowerTitle.includes('director') || lowerTitle.includes('head of')) {
      experienceLevel = 'director';
    }

    // Parse salary if present
    let salaryMin = 0;
    let salaryMax = 0;
    let hasSalary = false;
    if (item.salary) {
      hasSalary = true;
      const numbers = item.salary.match(/\d+[\d,]*/g);
      if (numbers && numbers.length >= 2) {
        salaryMin = parseInt(numbers[0].replace(/,/g, ''), 10);
        salaryMax = parseInt(numbers[1].replace(/,/g, ''), 10);
      } else if (numbers && numbers.length === 1) {
        salaryMin = parseInt(numbers[0].replace(/,/g, ''), 10);
      }
    }

    const deduplicationHash = createJobHash(item.company_name, item.title, item.id || item.url);

    return {
      title: item.title.trim(),
      company: item.company_name.trim(),
      location: item.candidate_required_location || 'Remote',
      country: item.candidate_required_location || 'Worldwide',
      description: item.description,
      descriptionSnippet: cleanedDesc.slice(0, 300) + '...',
      skills: detectedSkills,
      experienceLevel,
      salary: {
        min: salaryMin,
        max: salaryMax,
        currency: 'USD',
        period: 'yearly',
        raw: item.salary || '',
        hasSalary,
      },
      employmentType: (item.job_type || 'full-time').toLowerCase().includes('contract') ? 'contract' : 'full-time',
      workMode: 'remote',
      postedDate: item.publication_date ? new Date(item.publication_date) : new Date(),
      source: JOB_SOURCES.REMOTIVE,
      sourceId: String(item.id || ''),
      originalUrl: item.url,
      applyUrl: item.url,
      companyLogo: item.company_logo || '',
      deduplicationHash,
      isActive: true,
      tags: item.tags || [],
    };
  }
}
