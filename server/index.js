import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'express-async-errors'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import jobRoutes from './routes/job.routes.js'
import applicationRoutes from './routes/application.routes.js'
import { errorHandler } from './middleware/error.middleware.js'
import dotenv from 'dotenv'
dotenv.config()

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/applications', applicationRoutes)

// Error handler (always last)
app.use(errorHandler)

connectDB().then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`)
  })
})