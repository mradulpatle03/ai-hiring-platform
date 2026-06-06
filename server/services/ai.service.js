import axios from 'axios'

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

// ─── Core Groq call ───────────────────────────────────────────────────
const callGroq = async (systemPrompt, userPrompt, maxTokens = 1000) => {
  const response = await axios.post(
    GROQ_URL,
    {
      model:    GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
      max_tokens:  maxTokens,
      temperature: 0.3,   // lower = more consistent JSON output
    },
    {
      headers: {
        Authorization:  `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )
  return response.data.choices[0].message.content
}

// ─── Safe JSON parser — strips markdown fences if model adds them ─────
const parseJSON = (raw) => {
  const cleaned = raw
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim()
  return JSON.parse(cleaned)
}

// ─── 1. Parse job description ─────────────────────────────────────────
export const parseJobDescription = async (description) => {
  const system = `You are an expert technical recruiter.
Extract structured information from job descriptions.
Always respond with valid JSON only. No explanation, no markdown fences.`

  const user = `Extract from this job description and return as JSON:
{
  "skillsRequired": ["skill1", "skill2"],
  "experienceYears": 2,
  "roleType": "backend | frontend | fullstack | data | devops | other",
  "seniorityLevel": "junior | mid | senior | lead"
}

Job Description:
${description}`

  const raw = await callGroq(system, user)
  return parseJSON(raw)
}

// ─── 2. Standard resume scoring ───────────────────────────────────────
export const scoreResume = async (resumeText, jobDescription, jobSkills) => {
  const system = `You are an expert technical recruiter who evaluates resumes fairly.
Always respond with valid JSON only. No explanation, no markdown fences.`

  const user = `Score this resume against the job description.

JOB DESCRIPTION:
${jobDescription}

REQUIRED SKILLS: ${jobSkills.join(', ')}

CANDIDATE RESUME:
${resumeText.slice(0, 3000)}

Return JSON in exactly this format:
{
  "score": 78,
  "reasoning": "2-3 sentence explanation of the score",
  "missingSkills": ["skill1", "skill2"],
  "matchedSkills": ["skill3", "skill4"],
  "strengths": "one sentence about candidate strengths",
  "recommendation": "shortlist | reject | maybe"
}`

  const raw = await callGroq(system, user)
  return parseJSON(raw)
}

// ─── 3. Resume scoring WITH GitHub ───────────────────────────────────
export const scoreResumeWithGitHub = async (resumeText, jobDescription, jobSkills, githubSummary) => {
  const system = `You are an expert technical recruiter who evaluates candidates holistically.
Always respond with valid JSON only. No explanation, no markdown fences.`

  const user = `Score this candidate using BOTH their resume and GitHub profile.

JOB DESCRIPTION:
${jobDescription}

REQUIRED SKILLS: ${jobSkills.join(', ')}

CANDIDATE RESUME:
${resumeText.slice(0, 2500)}

CANDIDATE GITHUB:
${githubSummary}

Return JSON in exactly this format:
{
  "score": 84,
  "reasoning": "2-3 sentences using both resume and GitHub evidence",
  "missingSkills": ["skill1"],
  "matchedSkills": ["skill2", "skill3"],
  "githubInsights": "1-2 sentences about what GitHub shows",
  "strengths": "one sentence about the candidate's key strengths",
  "recommendation": "shortlist | reject | maybe"
}`

  const raw = await callGroq(system, user)
  return parseJSON(raw)
}

// ─── 4. XAI — multi-dimensional scoring ──────────────────────────────
export const scoreResumeXAI = async (resumeText, jobDescription, jobSkills, githubSummary = '') => {
  const system = `You are a senior technical recruiter and talent evaluation expert.
You evaluate candidates across multiple dimensions to give fair, explainable scores.
Always respond with valid JSON only. No explanation, no markdown fences.`

  const user = `Evaluate this candidate across 5 dimensions for the given role.

JOB DESCRIPTION:
${jobDescription}

REQUIRED SKILLS: ${jobSkills.join(', ')}

CANDIDATE RESUME:
${resumeText.slice(0, 2500)}

${githubSummary ? `GITHUB PROFILE:\n${githubSummary}` : ''}

Return JSON in exactly this format (scores must be 0-10 integers):
{
  "overallScore": 78,
  "recommendation": "shortlist | reject | maybe",
  "dimensions": {
    "technicalSkills": {
      "score": 8,
      "reasoning": "Specific evidence from resume/GitHub for this score",
      "highlights": ["highlight 1", "highlight 2"],
      "gaps": ["gap 1"]
    },
    "experienceDepth": {
      "score": 7,
      "reasoning": "Evidence of relevant work experience and project depth",
      "highlights": ["highlight 1"],
      "gaps": ["gap 1"]
    },
    "projectImpact": {
      "score": 6,
      "reasoning": "Quality and scale of projects — real-world impact shown",
      "highlights": ["highlight 1"],
      "gaps": ["gap 1"]
    },
    "communicationClarity": {
      "score": 7,
      "reasoning": "How clearly they communicate skills and achievements in resume",
      "highlights": ["highlight 1"],
      "gaps": ["gap 1"]
    },
    "growthPotential": {
      "score": 8,
      "reasoning": "Signs of learning, progression, and adaptability",
      "highlights": ["highlight 1"],
      "gaps": ["gap 1"]
    }
  },
  "summary": "2-3 sentence overall assessment of this candidate",
  "topStrengths": ["strength 1", "strength 2", "strength 3"],
  "criticalGaps": ["gap 1", "gap 2"],
  "interviewFocus": ["area to probe 1", "area to probe 2"]
}`

  const raw = await callGroq(system, user, 1500)
  return parseJSON(raw)
}

// ─── 5. Generate interview questions ─────────────────────────────────
export const generateInterviewQuestions = async (resumeText, jobDescription) => {
  const system = `You are a senior technical interviewer.
Generate targeted interview questions based on the candidate's resume and job.
Always respond with valid JSON only. No explanation, no markdown fences.`

  const user = `Generate 5 interview questions for this candidate.
Mix technical and behavioral. Make them specific to their background.

JOB: ${jobDescription.slice(0, 500)}
RESUME: ${resumeText.slice(0, 2000)}

Return JSON:
{
  "questions": [
    { "question": "...", "type": "technical | behavioral", "topic": "..." }
  ]
}`

  const raw = await callGroq(system, user)
  const parsed = parseJSON(raw)
  return parsed.questions.map(q => q.question)
}

// ─── 6. Generate embeddings (Groq doesn't support embeddings) ─────────
// We use a lightweight local approach: TF-IDF-inspired keyword overlap
// This replaces Pinecone for similarity — good enough for portfolio project
export const generateEmbedding = async (text) => {
  // Simple bag-of-words vector (256 dimensions) using char codes
  // In production you'd use OpenAI embeddings or a free HuggingFace model
  const words    = text.toLowerCase().match(/\b\w{3,}\b/g) || []
  const freq     = {}
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })

  // Create a deterministic 256-dim vector from top words
  const topWords = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, 256)
  const vector   = new Array(256).fill(0)
  topWords.forEach(([word, count], i) => {
    // Hash word to a position
    let hash = 0
    for (const c of word) hash = (hash * 31 + c.charCodeAt(0)) % 256
    vector[hash] += count
  })

  // Normalize
  const magnitude = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1
  return vector.map(v => v / magnitude)
}