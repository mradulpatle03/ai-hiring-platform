import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema({
  job:         { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume:      { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },

  // Status pipeline
  status: {
    type: String,
    enum: ['pending', 'screening', 'screened', 'shortlisted', 'rejected'],
    default: 'pending'
  },

  // AI fills these 
  aiScore:              { type: Number },       // 0–100
  aiReasoning:          { type: String },       // why this score
  aiMissingSkills:      [{ type: String }],     // gaps found
  aiInterviewQuestions: [{ type: String }],     // generated questions
  embeddingScore:       { type: Number },       // semantic similarity score
}, { timestamps: true })

// One candidate can apply to a job only once
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true })

export default mongoose.model('Application', applicationSchema)