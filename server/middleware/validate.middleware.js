import { ZodError } from 'zod'

// Validates req.body against a Zod schema
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body)  // parse also strips unknown fields
    next()
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map(e => ({
        field:   e.path.join('.'),
        message: e.message,
      }))
      return res.status(400).json({
        success: false,
        message: errors[0].message,  // first error as main message
        errors,                      // all errors for the frontend
      })
    }
    next(err)
  }
}

// Validates req.query against a Zod schema
export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query)
    next()
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: err.errors[0].message,
        errors:  err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      })
    }
    next(err)
  }
}