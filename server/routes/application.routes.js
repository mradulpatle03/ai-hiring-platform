import express from 'express'
import {
  applyToJob, getMyApplications,
  getJobApplicants, updateApplicationStatus, getRecommendedJobs, searchApplicants, getXAIBreakdown
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
router.get('/recommended', protect, restrictTo('candidate'), getRecommendedJobs)

// Recruiter
router.get('/job/:jobId',  protect, restrictTo('recruiter'), getJobApplicants)
router.get('/search', protect, restrictTo('recruiter'), searchApplicants)
router.patch('/:id/status', protect, restrictTo('recruiter'), updateApplicationStatus)
router.get('/:id/xai', protect, restrictTo('recruiter'), getXAIBreakdown)

export default router