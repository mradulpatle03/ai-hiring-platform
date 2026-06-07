import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return res.status(400).json({
        success: false,
        message: errors[0]?.message || "Validation failed",
        errors,
      });
    }

    next(err);
  }
};

export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return res.status(400).json({
        success: false,
        message: errors[0]?.message || "Validation failed",
        errors,
      });
    }

    next(err);
  }
};