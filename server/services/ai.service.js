const EMBEDDING_DIMENSION = 3072;

const SKILL_KEYWORDS = [
  "javascript",
  "typescript",
  "node.js",
  "node",
  "express",
  "nestjs",
  "react",
  "next.js",
  "next",
  "vue",
  "angular",
  "html",
  "css",
  "tailwind",
  "bootstrap",
  "mongodb",
  "mongoose",
  "mysql",
  "postgresql",
  "postgres",
  "sql",
  "redis",
  "graphql",
  "rest api",
  "api",
  "java",
  "spring boot",
  "python",
  "django",
  "flask",
  "fastapi",
  "c++",
  "c#",
  ".net",
  "php",
  "laravel",
  "go",
  "rust",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "firebase",
  "linux",
  "git",
  "github",
  "gitlab",
  "ci/cd",
  "jenkins",
  "terraform",
  "ansible",
  "microservices",
  "system design",
  "machine learning",
  "deep learning",
  "data analysis",
  "pandas",
  "numpy",
  "scikit-learn",
  "tensorflow",
  "pytorch",
  "power bi",
  "tableau",
  "figma",
  "ui/ux",
  "testing",
  "jest",
  "mocha",
  "selenium",
  "playwright",
  "cypress",
];

const ROLE_RULES = [
  {
    role: "backend",
    keywords: [
      "node",
      "express",
      "api",
      "server",
      "database",
      "microservices",
      "backend",
    ],
  },
  {
    role: "frontend",
    keywords: [
      "react",
      "vue",
      "angular",
      "frontend",
      "ui",
      "css",
      "html",
      "figma",
    ],
  },
  {
    role: "fullstack",
    keywords: [
      "full stack",
      "fullstack",
      "frontend",
      "backend",
      "react",
      "node",
    ],
  },
  {
    role: "data",
    keywords: [
      "machine learning",
      "data",
      "analytics",
      "python",
      "pandas",
      "sql",
      "tableau",
    ],
  },
  {
    role: "devops",
    keywords: [
      "docker",
      "kubernetes",
      "terraform",
      "aws",
      "azure",
      "gcp",
      "devops",
      "ci/cd",
    ],
  },
];

const normalizeText = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const unique = (items) => [...new Set(items)];

const SKILL_ALIASES = {
  "node.js": "Node.js",
  node: "Node.js",
  mongodb: "MongoDB",
  mongoose: "Mongoose",
  express: "Express",
  react: "React",
  "next.js": "Next.js",
  next: "Next.js",
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  mysql: "MySQL",
  sql: "SQL",
  api: "API",
  "rest api": "REST API",
  aws: "AWS",
  gcp: "GCP",
  azure: "Azure",
  docker: "Docker",
  kubernetes: "Kubernetes",
  javascript: "JavaScript",
  typescript: "TypeScript",
  html: "HTML",
  css: "CSS",
  github: "GitHub",
  gitlab: "GitLab",
  "ci/cd": "CI/CD",
  "ui/ux": "UI/UX",
};

const containsPhrase = (text, phrase) => {
  const pattern = new RegExp(`(^|\\s)${escapeRegex(phrase)}(?=\\s|$)`, "i");
  return pattern.test(text);
};

const extractSkills = (text) => {
  const normalized = normalizeText(text);
  const found = SKILL_KEYWORDS.filter((skill) => containsPhrase(normalized, skill)).map(
    formatSkill,
  );

  const withoutGenericApi =
    found.includes("REST API") && found.includes("API")
      ? found.filter((skill) => skill !== "API")
      : found;

  return unique(withoutGenericApi);
};

const formatSkill = (skill) =>
  SKILL_ALIASES[skill] ||
  skill
    .split(" ")
    .map((word) => {
      if (word === "c++" || word === "c#") return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

const extractExperienceYears = (text) => {
  const normalized = normalizeText(text);
  const matches = [...normalized.matchAll(/(\d+)\+?\s*(?:years|year|yrs|yr)/g)];
  const years = matches.map((match) => Number(match[1])).filter(Boolean);

  return years.length ? Math.max(...years) : 0;
};

const inferRoleType = (text) => {
  const normalized = normalizeText(text);

  let bestRole = "other";
  let bestScore = 0;

  for (const rule of ROLE_RULES) {
    const score = rule.keywords.reduce(
      (count, keyword) => count + (normalized.includes(keyword) ? 1 : 0),
      0,
    );

    if (score > bestScore) {
      bestScore = score;
      bestRole = rule.role;
    }
  }

  return bestRole;
};

const inferSeniorityLevel = (text) => {
  const normalized = normalizeText(text);

  if (/(lead|principal|staff)/.test(normalized)) return "lead";
  if (/(senior|sr\.?)/.test(normalized)) return "senior";
  if (/(junior|jr\.?|fresher|entry level|entry-level|intern)/.test(normalized))
    return "junior";

  const years = extractExperienceYears(normalized);
  if (years >= 7) return "lead";
  if (years >= 4) return "senior";
  if (years >= 2) return "mid";
  return "junior";
};

const tokenizeWords = (text) =>
  unique(
    normalizeText(text)
      .split(" ")
      .filter((word) => word.length > 2 && !/^\d+$/.test(word)),
  );

const buildReasoning = ({
  matchedSkills,
  missingSkills,
  skillCoverage,
  candidateYears,
  requiredYears,
}) => {
  const matched =
    matchedSkills.length > 0
      ? `Matched skills include ${matchedSkills.slice(0, 4).join(", ")}.`
      : "The resume has limited direct keyword overlap with the job requirements.";

  const gaps =
    missingSkills.length > 0
      ? `Missing or weak areas include ${missingSkills.slice(0, 4).join(", ")}.`
      : "The resume covers nearly all listed skills from the role.";

  const experience =
    requiredYears > 0
      ? `Estimated experience fit is ${candidateYears}/${requiredYears} years with skill coverage around ${skillCoverage}%.`
      : `Skill coverage is around ${skillCoverage}% based on the job description and resume text.`;

  return `${matched} ${gaps} ${experience}`;
};

const buildQuestionTemplates = ({
  matchedSkills,
  missingSkills,
  roleType,
  candidateYears,
}) => {
  const primaryMatched = matchedSkills[0] || "your strongest technical project";
  const secondaryMatched =
    matchedSkills[1] || (roleType === "frontend" ? "frontend architecture" : "backend design");
  const primaryGap = missingSkills[0] || "a technology in this role that is newer to you";
  const roleFocus =
    roleType === "frontend"
      ? "user experience and component design"
      : roleType === "data"
        ? "data quality and model decisions"
        : roleType === "devops"
          ? "deployment reliability and observability"
          : "system design and implementation tradeoffs";

  return [
    `Walk me through a project where you used ${primaryMatched} and explain the impact of your work.`,
    `How would you approach ${roleFocus} for this role, and what tradeoffs would you consider first?`,
    `This role appears to value ${primaryGap}. How would you get productive quickly if you had to use it on day one?`,
    `Tell me about a time you had to debug a difficult production or project issue. What was your process?`,
    `With roughly ${candidateYears || "your current"} years of experience, what kind of ownership do you usually take from problem definition to delivery?`,
    `If you were asked to improve an existing solution built with ${secondaryMatched}, what would you review before making changes?`,
  ].slice(0, 5);
};

const getRecommendation = (score) => {
  if (score >= 75) return "shortlist";
  if (score >= 50) return "maybe";
  return "reject";
};

export const parseJobDescription = async (description) => {
  const skillsRequired = extractSkills(description);
  const experienceYears = extractExperienceYears(description);
  const roleType = inferRoleType(description);
  const seniorityLevel = inferSeniorityLevel(description);

  return {
    skillsRequired,
    experienceYears,
    roleType,
    seniorityLevel,
  };
};

export const scoreResume = async (resumeText, jobDescription, jobSkills = []) => {
  const resumeSkills = extractSkills(resumeText);
  const requiredSkills = unique([
    ...jobSkills.map((skill) => formatSkill(normalizeText(skill))),
    ...extractSkills(jobDescription),
  ]).filter(Boolean);

  const matchedSkills = requiredSkills.filter((skill) =>
    resumeSkills.includes(skill),
  );
  const missingSkills = requiredSkills.filter(
    (skill) => !matchedSkills.includes(skill),
  );

  const candidateYears = extractExperienceYears(resumeText);
  const requiredYears = extractExperienceYears(jobDescription);

  const resumeTokens = new Set(tokenizeWords(resumeText));
  const jdTokens = tokenizeWords(jobDescription);
  const overlappingWords = jdTokens.filter((word) => resumeTokens.has(word));

  const skillCoverage = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : Math.min(100, overlappingWords.length * 4);

  const experienceScore =
    requiredYears > 0
      ? Math.min(100, Math.round((candidateYears / requiredYears) * 100))
      : candidateYears > 0
        ? 75
        : 50;

  const keywordScore = jdTokens.length
    ? Math.min(100, Math.round((overlappingWords.length / jdTokens.length) * 200))
    : 50;

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(skillCoverage * 0.6 + experienceScore * 0.25 + keywordScore * 0.15),
    ),
  );

  return {
    score,
    reasoning: buildReasoning({
      matchedSkills,
      missingSkills,
      skillCoverage,
      candidateYears,
      requiredYears,
    }),
    missingSkills,
    matchedSkills,
    strengths:
      matchedSkills.length > 0
        ? `Strongest alignment is around ${matchedSkills.slice(0, 3).join(", ")}.`
        : "Resume shows some general relevance but limited direct skill alignment.",
    recommendation: getRecommendation(score),
  };
};

export const generateInterviewQuestions = async (
  resumeText,
  jobDescription,
) => {
  const roleType = inferRoleType(jobDescription);
  const scoreResult = await scoreResume(resumeText, jobDescription, []);
  const candidateYears = extractExperienceYears(resumeText);

  return buildQuestionTemplates({
    matchedSkills: scoreResult.matchedSkills,
    missingSkills: scoreResult.missingSkills,
    roleType,
    candidateYears,
  });
};

export const generateEmbedding = async (text) => {
  const normalized = normalizeText(text);
  const embedding = new Array(EMBEDDING_DIMENSION).fill(0);

  for (const token of normalized.split(" ")) {
    if (!token) continue;

    let hash = 2166136261;
    for (let i = 0; i < token.length; i++) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const index = Math.abs(hash) % EMBEDDING_DIMENSION;
    embedding[index] += 1;
  }

  const magnitude = Math.sqrt(
    embedding.reduce((sum, value) => sum + value * value, 0),
  );

  if (!magnitude) {
    embedding[0] = 1;
    return embedding;
  }

  return embedding.map((value) => Number((value / magnitude).toFixed(6)));
};