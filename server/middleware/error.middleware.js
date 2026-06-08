import multer from "multer";

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError || err.message === "Only PDF files are allowed") {
    return res.status(400).json({ success: false, message: err.message });
  }
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || "Internal server error" });
};