const applicationSchema = new mongoose.Schema({
  job:       { type: mongoose.Schema.Types.ObjectId, ref: 'Job',    required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  resume:    { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },

  status: {
    type:    String,
    enum:    ['pending', 'screening', 'screened', 'shortlisted', 'rejected'],
    default: 'pending'
  },

  // Standard AI fields
  aiScore:              { type: Number  },
  aiReasoning:          { type: String  },
  aiMissingSkills:      [{ type: String }],
  aiInterviewQuestions: [{ type: String }],
  embeddingScore:       { type: Number  },
  githubInsights:       { type: String  },

  // XAI fields — multi-dimensional scores
  xai: {
    dimensions: {
      technicalSkills:      { score: Number, reasoning: String, highlights: [String], gaps: [String] },
      experienceDepth:      { score: Number, reasoning: String, highlights: [String], gaps: [String] },
      projectImpact:        { score: Number, reasoning: String, highlights: [String], gaps: [String] },
      communicationClarity: { score: Number, reasoning: String, highlights: [String], gaps: [String] },
      growthPotential:      { score: Number, reasoning: String, highlights: [String], gaps: [String] },
    },
    summary:        { type: String },
    topStrengths:   [{ type: String }],
    criticalGaps:   [{ type: String }],
    interviewFocus: [{ type: String }],
  },
}, { timestamps: true })