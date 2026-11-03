import crypto from 'crypto';

/**
 * Creates a unique SHA256 deduplication hash for a job posting
 * based on normalized company, title, and external ID/URL.
 */
export const createJobHash = (company, title, sourceIdOrUrl) => {
  const normalizedCompany = String(company || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normalizedTitle = String(title || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normalizedKey = String(sourceIdOrUrl || '').toLowerCase().trim();

  return crypto
    .createHash('sha256')
    .update(`${normalizedCompany}::${normalizedTitle}::${normalizedKey}`)
    .digest('hex');
};

/**
 * Normalizes text for clean NLP matching
 */
export const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, ' ') // Strip HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};
