export const TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Rust', 'Ruby',
  'PHP', 'Swift', 'Kotlin', 'SQL', 'HTML', 'HTML5', 'CSS', 'CSS3', 'Bash',
  'React', 'Next.js', 'Vue', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte', 'Redux',
  'Tailwind CSS', 'Tailwind', 'Bootstrap', 'DaisyUI', 'Material-UI', 'MUI',
  'Node.js', 'Express', 'Express.js', 'Nest.js', 'FastAPI', 'Django', 'Flask', 'Spring Boot',
  'GraphQL', 'REST', 'RESTful API', 'gRPC', 'WebSockets', 'Microservices',
  'MongoDB', 'PostgreSQL', 'Postgres', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB', 'Prisma', 'Mongoose',
  'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
  'GitHub Actions', 'Linux', 'Nginx',
  'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Transformers', 'LLM',
  'Git', 'GitHub', 'Agile', 'Scrum', 'Jira', 'UI/UX Design', 'Figma'
];

export const extractSkillsFromText = (text = '') => {
  if (!text) return [];
  const foundSkills = new Set();
  for (const skill of TECH_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9#+])${escaped}(?=[^a-zA-Z0-9#+]|$)`, 'i');
    if (regex.test(text)) {
      foundSkills.add(skill);
    }
  }
  return Array.from(foundSkills);
};
