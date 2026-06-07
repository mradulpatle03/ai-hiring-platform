import mongoose from 'mongoose'

import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true,  trim: true },
  email:    { type: String, required: true,  unique: true, lowercase: true },
  password: { type: String, required: true,  minlength: 6 },
  role:     { type: String, enum: ['recruiter', 'candidate'], required: true },
  company:  { type: String },
  avatar:   { type: String },

  // GitHub enrichment
  github: {
    connected:      { type: Boolean, default: false },
    accessToken:    { type: String   },        // stored encrypted ideally
    username:       { type: String   },
    profileUrl:     { type: String   },
    avatarUrl:      { type: String   },
    bio:            { type: String   },
    followers:      { type: Number   },
    publicRepos:    { type: Number   },
    topLanguages:   [{ type: String  }],       // ['TypeScript', 'Python', ...]
    totalStars:     { type: Number   },
    contributionScore: { type: Number },       // computed engagement score
    pinnedRepos: [{
      name:        String,
      description: String,
      stars:       Number,
      language:    String,
      url:         String,
    }],
    lastSynced:    { type: Date },
  },

}, { timestamps: true })

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Never send password in responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export default mongoose.model('User', userSchema)