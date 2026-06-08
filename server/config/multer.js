import multer from "multer";
import path from "path";
import fs from "fs";

let uploadMiddleware;

const initUpload = async () => {
  if (uploadMiddleware) return uploadMiddleware;

  // Use Cloudinary if credentials are set
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    console.log("📁 Using Cloudinary for file storage");
    const { upload } = await import("./cloudinary.js");
    uploadMiddleware = upload;
    return uploadMiddleware;
  }

  // Fallback to local disk storage
  console.log("📁 Using local disk for file storage");
  const uploadDir = "./uploads";
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });

  uploadMiddleware = multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "application/pdf") cb(null, true);
      else cb(new Error("Only PDF files are allowed"), false);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  return uploadMiddleware;
};

// Dynamic middleware wrapper
export const upload = {
  single: (fieldName) => async (req, res, next) => {
    const uploader = await initUpload();
    uploader.single(fieldName)(req, res, next);
  },
};
