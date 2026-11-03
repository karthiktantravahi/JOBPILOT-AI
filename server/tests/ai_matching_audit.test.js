import { describe, it, expect } from 'vitest';
import { MatchingService } from '../src/services/matchingService.js';
import { DEFAULT_MATCH_WEIGHTS } from '../src/config/constants.js';
import { cosineSimilarity, tokenJaccardSimilarity } from '../../client/src/ai/similarity.js';

describe('Phase 7: AI Matching Engine, Semantic Similarity & Weights Audit', () => {
  it('1. Configured Weights: verify weights strictly sum to 1.0 (100%)', () => {
    const sum =
      DEFAULT_MATCH_WEIGHTS.skills +
      DEFAULT_MATCH_WEIGHTS.experience +
      DEFAULT_MATCH_WEIGHTS.title +
      DEFAULT_MATCH_WEIGHTS.education +
      DEFAULT_MATCH_WEIGHTS.location +
      DEFAULT_MATCH_WEIGHTS.employmentType +
      DEFAULT_MATCH_WEIGHTS.salary;

    expect(Math.round(sum * 100) / 100).toBe(1.0);
    expect(DEFAULT_MATCH_WEIGHTS.skills).toBe(0.35);
    expect(DEFAULT_MATCH_WEIGHTS.experience).toBe(0.20);
    expect(DEFAULT_MATCH_WEIGHTS.title).toBe(0.15);
    expect(DEFAULT_MATCH_WEIGHTS.education).toBe(0.10);
    expect(DEFAULT_MATCH_WEIGHTS.location).toBe(0.10);
    expect(DEFAULT_MATCH_WEIGHTS.employmentType).toBe(0.05);
    expect(DEFAULT_MATCH_WEIGHTS.salary).toBe(0.05);
  });

  it('2. Score Boundedness: scores remain strictly between 10% and 99%', () => {
    // Worst case profile (no match whatsoever)
    const worstCaseProfile = {
      skills: ['Underwater Basket Weaving'],
      preferredJobTitles: ['Astronaut'],
      preferredWorkModes: ['onsite'],
      preferredEmploymentTypes: ['part-time'],
      expectedSalary: { min: 900000 },
      experience: [],
      education: [],
    };
    const techJob = {
      title: 'Senior Site Reliability Engineer',
      skills: ['Kubernetes', 'Go', 'Linux', 'Terraform'],
      experienceLevel: 'senior',
      workMode: 'remote',
      employmentType: 'full-time',
      salary: { hasSalary: true, min: 140000, max: 180000 },
    };

    const lowMatch = MatchingService.calculateMatch(worstCaseProfile, techJob);
    expect(lowMatch.matchPercentage).toBeGreaterThanOrEqual(10);
    expect(lowMatch.matchPercentage).toBeLessThan(50);

    // Best case profile (ideal match)
    const bestCaseProfile = {
      skills: ['Kubernetes', 'Go', 'Linux', 'Terraform', 'Prometheus'],
      preferredJobTitles: ['Site Reliability Engineer', 'SRE'],
      preferredWorkModes: ['remote'],
      preferredEmploymentTypes: ['full-time'],
      expectedSalary: { min: 150000 },
      experience: [
        { title: 'SRE', company: 'A' },
        { title: 'Senior SRE', company: 'B' },
        { title: 'Staff SRE', company: 'C' },
      ],
      education: [{ degree: "Bachelor's Degree", field: 'Computer Science' }],
    };

    const highMatch = MatchingService.calculateMatch(bestCaseProfile, techJob);
    expect(highMatch.matchPercentage).toBeGreaterThanOrEqual(85);
    expect(highMatch.matchPercentage).toBeLessThanOrEqual(99);
  });

  it('3. Skill and Missing Skill Detection: identifies matched vs missing skills accurately', () => {
    const profile = {
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
    };
    const job = {
      title: 'Frontend Engineer',
      skills: ['React', 'TypeScript', 'GraphQL', 'Next.js'],
    };

    const match = MatchingService.calculateMatch(profile, job);

    expect(match.matchedSkills).toContain('react');
    expect(match.matchedSkills).toContain('typescript');
    expect(match.missingSkills).toContain('graphql');
    expect(match.missingSkills).toContain('next.js');
  });

  it('4. Explainable Reasons: generates non-empty justifications explaining the score', () => {
    const profile = {
      skills: ['Python', 'PyTorch', 'Docker'],
      preferredJobTitles: ['Machine Learning Engineer'],
      preferredWorkModes: ['remote'],
    };
    const job = {
      title: 'Senior Machine Learning Engineer',
      skills: ['Python', 'PyTorch', 'AWS', 'TensorFlow'],
      workMode: 'remote',
    };

    const match = MatchingService.calculateMatch(profile, job);

    expect(Array.isArray(match.reasons)).toBe(true);
    expect(match.reasons.length).toBeGreaterThanOrEqual(2);
    expect(match.reasons.some((r) => r.toLowerCase().includes('skill') || r.toLowerCase().includes('matched'))).toBe(true);
    expect(match.reasons.some((r) => r.toLowerCase().includes('title') || r.toLowerCase().includes('interest') || r.toLowerCase().includes('role'))).toBe(true);
  });

  it('5. Dynamic Custom Weights: recalculates scores dynamically when weights change', () => {
    const profile = {
      skills: ['React', 'Node.js'],
      preferredJobTitles: ['Full Stack Engineer'],
      preferredWorkModes: ['onsite'], // Mismatched location
    };
    const job = {
      title: 'Full Stack Engineer',
      skills: ['React', 'Node.js'],
      workMode: 'remote',
    };

    // Standard weights
    const standardMatch = MatchingService.calculateMatch(profile, job);

    // Skill-dominated weights (skills 80%, location 0%)
    const skillHeavyMatch = MatchingService.calculateMatch(profile, job, {
      skills: 0.80,
      location: 0.0,
      experience: 0.10,
      title: 0.10,
      education: 0.0,
      employmentType: 0.0,
      salary: 0.0,
    });

    expect(skillHeavyMatch.matchPercentage).not.toBe(standardMatch.matchPercentage);
    expect(skillHeavyMatch.matchPercentage).toBeGreaterThanOrEqual(standardMatch.matchPercentage);
  });

  it('6. Cosine Similarity Vector Mathematics', () => {
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    const vecC = [0, 1, 0]; // Orthogonal (perpendicular)
    const vecD = [-1, 0, 0]; // Exact opposite

    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0, 5);
    expect(cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0, 5);
    expect(cosineSimilarity(vecA, vecD)).toBeCloseTo(-1.0, 5);
  });

  it('7. Token Jaccard Keyword Fallback: computes word intersection over union', () => {
    const str1 = 'Senior Frontend React Developer';
    const str2 = 'Senior React Engineer Developer';
    const similarity = tokenJaccardSimilarity(str1, str2);

    expect(similarity).toBeGreaterThan(0.4);
    expect(similarity).toBeLessThanOrEqual(1.0);

    const completelyDifferent = tokenJaccardSimilarity('Chef Cooking Italian', 'Kubernetes Cloud DevOps');
    expect(completelyDifferent).toBe(0);
  });
});
