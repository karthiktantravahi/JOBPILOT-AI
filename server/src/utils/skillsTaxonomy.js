export const TECH_SKILLS = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Rust', 'Ruby',
  'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'Dart', 'SQL', 'HTML', 'HTML5', 'CSS', 'CSS3', 'Bash', 'Shell',

  // Frontend & UI
  'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte', 'Redux',
  'Tailwind CSS', 'Tailwind', 'Bootstrap', 'DaisyUI', 'Material-UI', 'MUI', 'Chakra UI', 'Sass', 'SCSS',
  'Vite', 'Webpack', 'Jest', 'Cypress', 'Playwright', 'Responsive Design', 'Web Accessibility', 'WCAG',

  // Backend & APIs
  'Node.js', 'Express', 'Express.js', 'Nest.js', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Ruby on Rails',
  'GraphQL', 'REST', 'RESTful API', 'gRPC', 'WebSockets', 'Microservices', 'Serverless',

  // Databases & Storage
  'MongoDB', 'PostgreSQL', 'Postgres', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra',
  'SQLite', 'Firebase', 'Supabase', 'Prisma', 'Mongoose', 'TypeORM',

  // Cloud & DevOps
  'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'K8s',
  'Terraform', 'CI/CD', 'GitHub Actions', 'GitLab CI', 'Jenkins', 'Ansible', 'Prometheus', 'Grafana',
  'Linux', 'Nginx', 'Cloudflare',

  // AI & Data Science
  'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy',
  'NLP', 'Transformers', 'Hugging Face', 'Computer Vision', 'LLM', 'LangChain', 'OpenAI', 'Vector Database',
  'Data Engineering', 'Spark', 'Kafka', 'Airflow', 'BigQuery', 'Snowflake',

  // Mobile & Other
  'React Native', 'Flutter', 'iOS Development', 'Android Development',

  // Soft & Engineering Practices
  'Git', 'GitHub', 'GitLab', 'Agile', 'Scrum', 'Jira', 'TDD', 'Code Review', 'System Design',
  'Clean Architecture', 'Unit Testing', 'Product Management', 'UI/UX Design', 'Figma'
];

/**
 * Normalizes a skill string for case-insensitive matching
 */
export const normalizeSkill = (skill) => {
  return skill.toLowerCase().replace(/[\.\-_]/g, '').trim();
};

/**
 * Finds skills present in the given text using boundaries and regex
 */
export const extractSkillsFromText = (text) => {
  if (!text) return [];
  const foundSkills = new Set();
  const lowerText = text.toLowerCase();

  for (const skill of TECH_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Boundary check allowing for punctuation like C++, C#, .NET
    const regex = new RegExp(`(^|[^a-zA-Z0-9#+])${escaped}(?=[^a-zA-Z0-9#+]|$)`, 'i');
    if (regex.test(text)) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills);
};
