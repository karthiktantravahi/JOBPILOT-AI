import pdfParse from 'pdf-parse';
import { extractSkillsFromText } from '../utils/skillsTaxonomy.js';
import { cleanText } from '../utils/hash.js';
import { logger } from '../utils/logger.js';

export class ResumeParserService {
  /**
   * Parse PDF buffer and extract structured resume data
   * @param {Buffer} pdfBuffer
   * @param {string} originalFilename
   */
  static async parsePdf(pdfBuffer, originalFilename = 'resume.pdf') {
    try {
      const pdfData = await pdfParse(pdfBuffer);
      const rawText = pdfData.text || '';
      return this.parseText(rawText, originalFilename);
    } catch (error) {
      logger.error('Error in parsePdf:', error);
      throw new Error(`Failed to parse PDF document: ${error.message}`);
    }
  }

  /**
   * Extract structured resume entities from raw text
   * @param {string} text
   * @param {string} originalFilename
   */
  static parseText(text, originalFilename = 'resume.txt') {
    const cleaned = cleanText(text);
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    // 1. Extract Contact Information
    const email = this.extractEmail(text);
    const phone = this.extractPhone(text);
    const links = this.extractLinks(text);
    const name = this.extractName(lines, email);

    // 2. Extract Skills
    const skills = extractSkillsFromText(text);

    // 3. Extract Education
    const education = this.extractEducation(text);

    // 4. Extract Experience
    const experience = this.extractExperience(text);

    // 5. Extract Projects
    const projects = this.extractProjects(text);

    // 6. Extract Certifications
    const certifications = this.extractCertifications(text);

    // 7. Extract Summary / Bio
    const bio = this.extractSummary(text);

    return {
      fileName: originalFilename,
      extractedAt: new Date().toISOString(),
      name,
      email,
      phone,
      links,
      bio,
      skills,
      education,
      experience,
      projects,
      certifications,
      rawTextPreview: cleaned.slice(0, 1500),
    };
  }

  static extractEmail(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/i;
    const match = text.match(emailRegex);
    return match ? match[0].toLowerCase() : '';
  }

  static extractPhone(text) {
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const match = text.match(phoneRegex);
    return match ? match[0].trim() : '';
  }

  static extractLinks(text) {
    const linkedinMatch = text.match(/linkedin\.com\/in\/([A-Za-z0-9_-]+)/i);
    const githubMatch = text.match(/github\.com\/([A-Za-z0-9_-]+)/i);
    const portfolioMatch = text.match(/https?:\/\/(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i);

    return {
      linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : '',
      github: githubMatch ? `https://${githubMatch[0]}` : '',
      portfolio: portfolioMatch ? portfolioMatch[0] : '',
    };
  }

  static extractName(lines, email) {
    const skipKeywords = [
      'resume',
      'curriculum vitae',
      'cv',
      'contact',
      'experience',
      'education',
      'skills',
      'summary',
      'profile',
    ];

    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      if (!line) continue;
      const lower = line.toLowerCase();

      if (skipKeywords.some((k) => lower.includes(k))) continue;
      if (email && lower.includes(email.toLowerCase())) continue;
      if (/^[0-9+()-\s]{7,}$/.test(line)) continue; // Pure phone number
      if (line.includes('@') || line.includes('http') || line.includes('www.')) continue;

      // Likely a human name if 2-4 words, mostly letters
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 5 && /^[A-Za-z.\s'-]+$/.test(line)) {
        return line;
      }
    }
    return '';
  }

  static extractEducation(text) {
    const degreeKeywords = [
      { pattern: /\b(?:Bachelor(?:'s)?(?:\s+of\s+[A-Za-z]+)?|B\.?S\.?|B\.?A\.?|B\.?Tech|B\.?E\.?)\b/i, degree: "Bachelor's Degree" },
      { pattern: /\b(?:Master(?:'s)?(?:\s+of\s+[A-Za-z]+)?|M\.?S\.?|M\.?A\.?|M\.?Tech|M\.?B\.?A\.?)\b/i, degree: "Master's Degree" },
      { pattern: /\b(?:Doctor\s+of\s+Philosophy|Ph\.?D\.?)\b/i, degree: 'Doctorate (Ph.D.)' },
      { pattern: /\b(?:Associate(?:'s)?(?:\s+Degree)?|A\.?S\.?|A\.?A\.?)\b/i, degree: "Associate's Degree" },
    ];

    const educationList = [];
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const { pattern, degree } of degreeKeywords) {
        if (pattern.test(line)) {
          // Check for graduation year in this line or nearby
          const yearMatch = (line + ' ' + (lines[i + 1] || '')).match(/\b(19\d{2}|20\d{2})\b/);
          const graduationYear = yearMatch ? parseInt(yearMatch[1], 10) : undefined;

          // Check for field of study
          const fieldMatch = line.match(/(?:in|of)\s+([A-Za-z\s]+)(?:,|;|\.|\n|$)/i);
          const field = fieldMatch ? fieldMatch[1].trim() : 'Computer Science / Engineering';

          // Look for institution name in previous or next line
          let institution = 'University / College';
          const uniRegex = /(?:University|College|Institute|Academy|School)/i;
          if (uniRegex.test(line)) {
            institution = line;
          } else if (lines[i - 1] && uniRegex.test(lines[i - 1])) {
            institution = lines[i - 1];
          } else if (lines[i + 1] && uniRegex.test(lines[i + 1])) {
            institution = lines[i + 1];
          }

          educationList.push({
            degree,
            field,
            institution,
            graduationYear,
          });
          break;
        }
      }
    }

    // Deduplicate
    const unique = [];
    const seen = new Set();
    for (const edu of educationList) {
      const key = `${edu.degree}-${edu.institution}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(edu);
      }
    }

    return unique.length > 0 ? unique : [{
      degree: "Bachelor's Degree",
      field: "Software Engineering",
      institution: "University",
      graduationYear: new Date().getFullYear(),
    }];
  }

  static extractExperience(text) {
    const experiences = [];
    const titleKeywords = [
      'Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
      'Web Developer', 'DevOps Engineer', 'Cloud Architect', 'Data Scientist', 'Machine Learning Engineer',
      'Product Manager', 'Engineering Manager', 'Tech Lead', 'Mobile Developer', 'Intern'
    ];

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const title of titleKeywords) {
        if (new RegExp(`\\b${title}\\b`, 'i').test(line)) {
          // Look for company and dates around this line
          const contextLines = [lines[i - 1], line, lines[i + 1], lines[i + 2]].filter(Boolean).join(' ');
          const dateMatch = contextLines.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4})\s*(?:-|–|to)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4}|Present|Current)/i);

          const startDate = dateMatch ? dateMatch[1] : '2022';
          const endDate = dateMatch ? dateMatch[2] : 'Present';
          const isCurrent = /Present|Current/i.test(endDate);

          // Approximate company
          let company = 'Tech Company';
          const atMatch = line.match(/(?:at|@)\s+([A-Za-z0-9&.\s]+)/i);
          if (atMatch) {
            company = atMatch[1].trim();
          } else if (lines[i - 1] && lines[i - 1].length < 40 && !dateMatch) {
            company = lines[i - 1];
          }

          experiences.push({
            title,
            company,
            startDate,
            endDate,
            current: isCurrent,
            description: `Worked as a ${title} developing scalable solutions and collaborating across teams.`,
          });
          break;
        }
      }
    }

    // Deduplicate
    const unique = [];
    const seen = new Set();
    for (const exp of experiences) {
      const key = `${exp.title}-${exp.company}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(exp);
      }
    }

    return unique;
  }

  static extractProjects(text) {
    const projects = [];
    const projectHeaderRegex = /(?:Personal\s+Projects|Projects|Featured\s+Projects)/i;
    const match = text.search(projectHeaderRegex);

    if (match !== -1) {
      const snippet = text.slice(match, match + 1500);
      const lines = snippet.split('\n').map((l) => l.trim()).filter(Boolean).slice(1);

      for (let i = 0; i < Math.min(lines.length, 6); i++) {
        const line = lines[i];
        if (line.length > 5 && line.length < 50 && !line.includes(':')) {
          projects.push({
            title: line,
            description: lines[i + 1] && lines[i + 1].length > 20 ? lines[i + 1] : 'Web application built with modern technologies.',
            technologies: extractSkillsFromText(line + ' ' + (lines[i + 1] || '')),
          });
          i++; // skip description line
        }
      }
    }

    return projects;
  }

  static extractCertifications(text) {
    const certKeywords = [
      'AWS Certified', 'Solutions Architect', 'Cloud Practitioner', 'Developer Associate',
      'Google Cloud Certified', 'Professional Cloud Architect', 'Associate Cloud Engineer',
      'Azure Fundamentals', 'AZ-900', 'CKA', 'Certified Kubernetes Administrator',
      'PMP', 'Scrum Master', 'CompTIA', 'Security+'
    ];

    const certs = [];
    for (const cert of certKeywords) {
      if (new RegExp(cert, 'i').test(text)) {
        certs.push({
          name: cert,
          issuer: cert.includes('AWS') ? 'Amazon Web Services' : cert.includes('Google') ? 'Google Cloud' : cert.includes('Azure') ? 'Microsoft' : 'Industry Certification',
          issueDate: '2023',
        });
      }
    }

    return certs;
  }

  static extractSummary(text) {
    const summaryMatch = text.match(/(?:Professional\s+Summary|Executive\s+Summary|About\s+Me|Profile|Summary)[\s:\n]+([^]*?)(?=(?:Experience|Education|Skills|Projects|Work\s+History|$))/i);
    if (summaryMatch && summaryMatch[1]) {
      return summaryMatch[1].trim().slice(0, 500);
    }
    return '';
  }
}
