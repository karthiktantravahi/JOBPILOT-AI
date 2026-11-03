import axios from 'axios';
import { createJobHash, cleanText } from '../../utils/hash.js';
import { extractSkillsFromText } from '../../utils/skillsTaxonomy.js';
import { JOB_SOURCES } from '../../config/constants.js';
import { logger } from '../../utils/logger.js';

export class GreenhouseAdapter {
  static get sourceName() {
    return JOB_SOURCES.GREENHOUSE;
  }

  // Public greenhouse board tokens that permit public board reads
  static defaultBoards = ['gitlab', 'cloudflare'];

  /**
   * Fetches public job postings from Greenhouse board endpoints
   * @param {string[]} boards
   */
  static async fetchJobs(boards = this.defaultBoards) {
    const allJobs = [];

    for (const board of boards) {
      try {
        logger.info(`[GreenhouseAdapter] Fetching board: ${board}...`);
        const url = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`;
        const response = await axios.get(url, {
          timeout: 10000,
          headers: { 'User-Agent': 'JobPilot-AI-Sync/1.0' },
        });

        const rawJobs = response.data?.jobs || [];
        logger.info(`[GreenhouseAdapter] ${board} returned ${rawJobs.length} postings.`);

        for (const item of rawJobs.slice(0, 25)) {
          const normalized = this.normalize(item, board);
          if (normalized) allJobs.push(normalized);
        }
      } catch (error) {
        logger.warn(`[GreenhouseAdapter] Could not fetch board ${board}: ${error.message}`);
      }
    }

    return allJobs;
  }

  static normalize(item, boardToken) {
    if (!item.title || !item.absolute_url) return null;

    const companyName = boardToken.charAt(0).toUpperCase() + boardToken.slice(1);
    const rawContent = item.content || '';
    const cleanedDesc = cleanText(rawContent);
    const locationName = item.location?.name || 'Remote';

    // Work mode detection
    let workMode = 'onsite';
    const lowerLoc = locationName.toLowerCase();
    if (lowerLoc.includes('remote') || lowerLoc.includes('anywhere')) {
      workMode = 'remote';
    } else if (lowerLoc.includes('hybrid')) {
      workMode = 'hybrid';
    }

    const detectedSkills = extractSkillsFromText(item.title + ' ' + cleanedDesc);

    // Experience detection
    let experienceLevel = 'mid';
    const lowerTitle = item.title.toLowerCase();
    if (lowerTitle.includes('senior') || lowerTitle.includes('sr.') || lowerTitle.includes('staff') || lowerTitle.includes('principal')) {
      experienceLevel = 'senior';
    } else if (lowerTitle.includes('junior') || lowerTitle.includes('entry') || lowerTitle.includes('associate') || lowerTitle.includes('intern')) {
      experienceLevel = 'entry';
    } else if (lowerTitle.includes('director') || lowerTitle.includes('manager') || lowerTitle.includes('head')) {
      experienceLevel = 'lead';
    }

    const deduplicationHash = createJobHash(companyName, item.title, String(item.id || item.absolute_url));

    return {
      title: item.title.trim(),
      company: companyName,
      location: locationName,
      country: locationName.includes(',') ? locationName.split(',').pop().trim() : locationName,
      description: rawContent || `${item.title} at ${companyName}. Visit official posting for details.`,
      descriptionSnippet: (cleanedDesc.slice(0, 300) || `${item.title} at ${companyName}`) + '...',
      skills: detectedSkills,
      experienceLevel,
      salary: {
        min: 0,
        max: 0,
        currency: 'USD',
        period: 'yearly',
        raw: '',
        hasSalary: false,
      },
      employmentType: 'full-time',
      workMode,
      postedDate: item.updated_at ? new Date(item.updated_at) : new Date(),
      source: JOB_SOURCES.GREENHOUSE,
      sourceId: String(item.id),
      originalUrl: item.absolute_url,
      applyUrl: item.absolute_url,
      companyLogo: '',
      deduplicationHash,
      isActive: true,
      tags: [boardToken, workMode],
    };
  }
}
