import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  description:    { type: String, required: true },
  company:        { type: String, required: true },
  location:       { type: String, default: 'Remote' },
  skillsRequired: [{ type: String }],   // AI will populate this later
  experienceYears:{ type: Number, default: 0 },
  salary:         { type: String },
  status:         { type: String, enum: ['open', 'closed'], default: 'open' },
  recruiter:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

export default mongoose.model('Job', jobSchema)