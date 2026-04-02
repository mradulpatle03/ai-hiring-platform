import express from 'express'
import {
  createJob, getAllJobs, getJobById,
  getMyJobs, updateJob, closeJob
} from '../controllers/job.controller.js'
import { protect, restrictTo } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/',            getAllJobs)                              // public
router.get('/:id',         getJobById)                             // public
router.get('/recruiter/mine', protect, restrictTo('recruiter'), getMyJobs)
router.post('/',           protect, restrictTo('recruiter'), createJob)
router.patch('/:id',       protect, restrictTo('recruiter'), updateJob)
router.patch('/:id/close', protect, restrictTo('recruiter'), closeJob)

export default router