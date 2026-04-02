import express from 'express'
import {
  applyToJob, getMyApplications,
  getJobApplicants, updateApplicationStatus
} from '../controllers/application.controller.js'
import { protect, restrictTo } from '../middleware/auth.middleware.js'
import { upload } from '../config/multer.js'

const router = express.Router()

// Candidate
router.post('/',
  protect,
  restrictTo('candidate'),
  upload.single('resume'),   // 'resume' = form field name
  applyToJob
)
router.get('/mine', protect, restrictTo('candidate'), getMyApplications)

// Recruiter
router.get('/job/:jobId',  protect, restrictTo('recruiter'), getJobApplicants)
router.patch('/:id/status', protect, restrictTo('recruiter'), updateApplicationStatus)

export default router