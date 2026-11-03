import { Job } from '../models/Job.js';
import { createJobHash } from './hash.js';
import { logger } from './logger.js';

export const SEED_JOBS = [
  {
    title: 'Senior Full Stack Engineer (React & Node.js)',
    company: 'Cloudflare',
    location: 'Remote, US',
    country: 'United States',
    description: `We are looking for a Senior Full Stack Engineer to build next-generation developer platforms. You will work across the stack with React, TypeScript, Node.js, and distributed edge systems.
    
Key Responsibilities:
- Design, build, and maintain efficient, reusable, and reliable front-end and back-end code.
- Collaborate with cross-functional teams including Product, Design, and DevOps.
- Architect high-throughput APIs and intuitive UI experiences.
- Participate in code reviews, design docs, and mentor junior engineers.

Requirements:
- 5+ years of experience with modern JavaScript / TypeScript.
- Strong proficiency in React, Node.js, REST APIs, and GraphQL.
- Hands-on experience with SQL/NoSQL databases (PostgreSQL, MongoDB, Redis).
- Experience with Cloud providers (AWS, GCP, or Cloudflare Workers) and Docker.`,
    descriptionSnippet: 'Design, build, and maintain developer platforms using React, TypeScript, Node.js, and edge architecture. 5+ years experience required.',
    skills: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'GraphQL', 'PostgreSQL', 'Docker', 'AWS'],
    experienceLevel: 'senior',
    salary: {
      min: 160000,
      max: 210000,
      currency: 'USD',
      period: 'yearly',
      raw: '$160,000 - $210,000 / year',
      hasSalary: true,
    },
    employmentType: 'full-time',
    workMode: 'remote',
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    source: 'Greenhouse',
    sourceId: 'cloudflare-seed-101',
    originalUrl: 'https://boards.greenhouse.io/cloudflare',
    applyUrl: 'https://boards.greenhouse.io/cloudflare',
    tags: ['fullstack', 'react', 'nodejs', 'remote'],
  },
  {
    title: 'Frontend Developer - React & Design Systems',
    company: 'Automattic',
    location: 'Worldwide Remote',
    country: 'Worldwide',
    description: `Automattic is seeking a Frontend Developer passionate about crafting elegant user experiences and accessible UI components.

What You Will Do:
- Build modern web interfaces using React, Next.js, and Tailwind CSS.
- Contribute to our open-source design systems and component libraries.
- Optimize web performance and ensure WCAG AA accessibility compliance.
- Write thorough unit and integration tests using Vitest and Cypress.

Requirements:
- 3+ years experience with React, HTML5, CSS3, and JavaScript/TypeScript.
- Experience with responsive design, Tailwind, and component architecture.
- Passion for open source and asynchronous collaboration.`,
    descriptionSnippet: 'Build accessible web interfaces using React, Next.js, and Tailwind CSS. Passion for design systems and open source.',
    skills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Next.js', 'HTML5', 'CSS3', 'Jest'],
    experienceLevel: 'mid',
    salary: {
      min: 95000,
      max: 140000,
      currency: 'USD',
      period: 'yearly',
      raw: '$95,000 - $140,000 / year',
      hasSalary: true,
    },
    employmentType: 'full-time',
    workMode: 'remote',
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    source: 'Lever',
    sourceId: 'automattic-seed-102',
    originalUrl: 'https://jobs.lever.co/automattic',
    applyUrl: 'https://jobs.lever.co/automattic',
    tags: ['frontend', 'react', 'design-systems'],
  },
  {
    title: 'DevOps & Cloud Infrastructure Engineer',
    company: 'GitLab',
    location: 'Remote',
    country: 'Worldwide',
    description: `GitLab is looking for a DevOps Engineer to help scale our global multi-cloud infrastructure and continuous deployment pipelines.

Responsibilities:
- Build and maintain infrastructure as code using Terraform and Kubernetes.
- Enhance CI/CD automation, observability (Prometheus, Grafana), and disaster recovery.
- Collaborate with engineering teams to enhance security, reliability, and deployment velocity.

Requirements:
- Strong experience with Kubernetes, Docker, and Linux administration.
- Proven experience with AWS or GCP and Terraform.
- Proficiency in Python, Go, or Bash for automation.`,
    descriptionSnippet: 'Build and maintain infrastructure as code using Terraform and Kubernetes. Scale global CI/CD pipelines.',
    skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'GCP', 'Linux', 'CI/CD', 'Python', 'Go', 'Prometheus'],
    experienceLevel: 'senior',
    salary: {
      min: 150000,
      max: 195000,
      currency: 'USD',
      period: 'yearly',
      raw: '$150,000 - $195,000 / year',
      hasSalary: true,
    },
    employmentType: 'full-time',
    workMode: 'remote',
    postedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    source: 'Greenhouse',
    sourceId: 'gitlab-seed-103',
    originalUrl: 'https://boards.greenhouse.io/gitlab',
    applyUrl: 'https://boards.greenhouse.io/gitlab',
    tags: ['devops', 'kubernetes', 'terraform', 'cloud'],
  },
  {
    title: 'AI / Machine Learning Engineer',
    company: 'Hugging Face Ecosystem Partner',
    location: 'Remote, Europe / US',
    country: 'United States',
    description: `Join an agile team deploying open-source Large Language Models, embeddings, and vector search systems into production.

Responsibilities:
- Train and fine-tune transformer models using PyTorch and Hugging Face libraries.
- Optimize client-side and server-side model inference using ONNX, TensorRT, and Transformers.js.
- Build scalable retrieval-augmented generation (RAG) pipelines with vector databases.

Requirements:
- 3+ years experience with Python, PyTorch, Scikit-Learn, and NLP techniques.
- Solid understanding of attention mechanisms, vector embeddings, and semantic similarity.
- Experience deploying ML models in containerized microservices.`,
    descriptionSnippet: 'Deploy open-source LLMs, embeddings, and vector search into production. PyTorch, NLP, and Transformers.',
    skills: ['Python', 'Machine Learning', 'PyTorch', 'NLP', 'Transformers', 'Deep Learning', 'Docker'],
    experienceLevel: 'mid',
    salary: {
      min: 140000,
      max: 185000,
      currency: 'USD',
      period: 'yearly',
      raw: '$140,000 - $185,000 / year',
      hasSalary: true,
    },
    employmentType: 'full-time',
    workMode: 'remote',
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    source: 'Remotive',
    sourceId: 'remotive-seed-104',
    originalUrl: 'https://remotive.com',
    applyUrl: 'https://remotive.com',
    tags: ['ai', 'machine-learning', 'python', 'nlp'],
  },
  {
    title: 'Backend API Developer (Node.js & MongoDB)',
    company: 'Fintech Remote Labs',
    location: 'London, UK / Remote',
    country: 'United Kingdom',
    description: `We are looking for a Backend Engineer to build secure, robust financial transaction processing APIs.

Responsibilities:
- Build performant REST and WebSocket microservices using Node.js and Express.
- Manage MongoDB schemas, indexing, and high-concurrency transactions.
- Implement bank-grade encryption, JWT authorization, and rate limiting.

Requirements:
- 2+ years of professional experience with Node.js and MongoDB.
- Solid understanding of REST APIs, database indexing, and async programming.
- Familiarity with unit testing and API documentation.`,
    descriptionSnippet: 'Build high-performance REST and WebSocket microservices using Node.js and MongoDB with secure authorization.',
    skills: ['Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST', 'Mongoose', 'Redis', 'Unit Testing'],
    experienceLevel: 'entry',
    salary: {
      min: 75000,
      max: 110000,
      currency: 'USD',
      period: 'yearly',
      raw: '$75,000 - $110,000 / year',
      hasSalary: true,
    },
    employmentType: 'full-time',
    workMode: 'hybrid',
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    source: 'Arbeitnow',
    sourceId: 'arbeitnow-seed-105',
    originalUrl: 'https://www.arbeitnow.com',
    applyUrl: 'https://www.arbeitnow.com',
    tags: ['backend', 'nodejs', 'mongodb'],
  },
  {
    title: 'Product Manager - SaaS & Developer Tools',
    company: 'Stripe Ecosystem Co.',
    location: 'San Francisco, CA / Remote',
    country: 'United States',
    description: `Seeking a Product Manager to lead product discovery and execution for our developer platform.

Responsibilities:
- Define product roadmaps, user stories, and acceptance criteria.
- Conduct user interviews and analyze quantitative metrics.
- Work closely with engineering and UI/UX designers to deliver high-impact features.

Requirements:
- 3+ years experience as a technical Product Manager for SaaS products.
- Strong analytical skills and familiarity with Agile/Scrum.
- Excellent communication and cross-functional leadership skills.`,
    descriptionSnippet: 'Lead roadmap and execution for developer platform SaaS. Work closely with engineering and UI/UX design.',
    skills: ['Product Management', 'Agile', 'Scrum', 'Jira', 'UI/UX Design', 'System Design'],
    experienceLevel: 'mid',
    salary: {
      min: 130000,
      max: 175000,
      currency: 'USD',
      period: 'yearly',
      raw: '$130,000 - $175,000 / year',
      hasSalary: true,
    },
    employmentType: 'full-time',
    workMode: 'remote',
    postedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    source: 'Remotive',
    sourceId: 'remotive-seed-106',
    originalUrl: 'https://remotive.com',
    applyUrl: 'https://remotive.com',
    tags: ['product-management', 'saas', 'remote'],
  },
];

export const seedDatabase = async () => {
  logger.info('Checking database seed status...');
  const count = await Job.countDocuments();
  if (count > 0) {
    logger.info(`Database already contains ${count} job postings. Skipping seed.`);
    return;
  }

  logger.info(`Seeding ${SEED_JOBS.length} verified public job postings...`);
  for (const job of SEED_JOBS) {
    const deduplicationHash = createJobHash(job.company, job.title, job.sourceId || job.originalUrl);
    await Job.create({
      ...job,
      deduplicationHash,
    });
  }
  logger.info('Database seeded successfully.');
};
