import mongoose from 'mongoose'

const resumeSchema = new mongoose.Schema({
  candidate:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl:     { type: String, required: true },   // path to uploaded file
  parsedText:  { type: String },                   // raw text extracted from PDF
  fileName:    { type: String },
}, { timestamps: true })

export default mongoose.model('Resume', resumeSchema)