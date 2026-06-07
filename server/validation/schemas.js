import { z } from 'zod'

// ─── Auth ─────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2,  'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters'),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(6,  'Password must be at least 6 characters')
    .max(72, 'Password must be under 72 characters'),

  role: z
    .enum(['recruiter', 'candidate'], {
      errorMap: () => ({ message: 'Role must be recruiter or candidate' })
    }),

  // company: z
  //   .string()
  //   .trim()
  //   .min(2,  'Company name must be at least 2 characters')
  //   .max(100,'Company name is too long')
  //   .optional(),
  
  company: z.preprocess(
  (val) => val === "" ? undefined : val,
  z.string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name is too long")
    .optional()
)
}).refine(
  data => data.role !== 'recruiter' || !!data.company,
  { message: 'Company name is required for recruiters', path: ['company'] }
)

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email address'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
})

// ─── Jobs ─────────────────────────────────────────────────────────────
export const createJobSchema = z.object({
  title: z
    .string({ required_error: 'Job title is required' })
    .trim()
    .min(3,   'Title must be at least 3 characters')
    .max(100, 'Title must be under 100 characters'),

  description: z
    .string({ required_error: 'Job description is required' })
    .trim()
    .min(50,  'Description must be at least 50 characters — add more detail for better AI screening')
    .max(5000,'Description must be under 5000 characters'),

  location: z
    .string()
    .trim()
    .max(100, 'Location must be under 100 characters')
    .default('Remote'),

  salary: z
    .string()
    .trim()
    .max(50, 'Salary field is too long')
    .optional(),

  experienceYears: z.coerce
    .number()
    .int('Experience years must be a whole number')
    .min(0,  'Experience years cannot be negative')
    .max(20, 'Experience years seems too high')
    .default(0),
})

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(['open', 'closed']).optional(),
})

// ─── Applications ─────────────────────────────────────────────────────
export const applyToJobSchema = z.object({
  jobId: z
    .string({ required_error: 'Job ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid job ID format'),
})

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['shortlisted', 'rejected'], {
    errorMap: () => ({ message: 'Status must be shortlisted or rejected' })
  }),
})

// ─── Interviews ───────────────────────────────────────────────────────
export const proposeSlotsSchema = z.object({
  applicationId: z
    .string({ required_error: 'Application ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid application ID'),

  slots: z
    .array(
      z.string()
        .refine(
          val => !isNaN(new Date(val).getTime()),
          { message: 'Each slot must be a valid date and time' }
        )
        .transform(val => new Date(val).toISOString())  // normalize to ISO on server
    )
    .min(1, 'Provide at least one time slot')
    .max(5, 'Maximum 5 slots allowed'),

  meetLink: z
    .string()
    .url('Meet link must be a valid URL')
    .optional()
    .or(z.literal('')),

  notes: z
    .string()
    .max(500, 'Notes must be under 500 characters')
    .optional(),
})

export const confirmSlotSchema = z.object({
  slotId: z
    .string({ required_error: 'Slot ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid slot ID'),
})

// ─── Conversations / Messages ─────────────────────────────────────────
export const sendMessageSchema = z.object({
  text: z
    .string({ required_error: 'Message text is required' })
    .trim()
    .min(1,    'Message cannot be empty')
    .max(2000, 'Message must be under 2000 characters'),
})

// ─── Search query ─────────────────────────────────────────────────────
export const searchQuerySchema = z.object({
  search:    z.string().max(100).optional(),
  minScore:  z.coerce.number().min(0).max(100).optional(),
  maxScore:  z.coerce.number().min(0).max(100).optional(),
  skills:    z.string().max(500).optional(),
  status:    z.enum(['pending','screening','screened','shortlisted','rejected']).optional(),
  hasGitHub: z.enum(['true','false']).optional(),
  sortBy:    z.enum(['score','date','name']).default('score'),
  sortOrder: z.enum(['asc','desc']).default('desc'),
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(20),
  jobId:     z.string().regex(/^[a-f\d]{24}$/i).optional(),
}).refine(
  data => !data.minScore || !data.maxScore || data.minScore <= data.maxScore,
  { message: 'minScore must be less than or equal to maxScore' }
)