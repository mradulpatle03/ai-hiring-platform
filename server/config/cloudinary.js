import { v2 as cloudinary }        from 'cloudinary'
import { CloudinaryStorage }        from 'multer-storage-cloudinary'
import multer                       from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:        'hireai-resumes',
    resource_type: 'raw',
    format:        'pdf',
    public_id:     `resume_${Date.now()}_${req.user?._id || 'unknown'}`,
  }),
})

export const upload = multer({
  storage,
  limits:     { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are allowed'), false)
  },
})