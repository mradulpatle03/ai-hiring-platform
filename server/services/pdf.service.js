import pdfParse from "pdf-parse/lib/pdf-parse.js";
import axios from "axios";
import fs from "fs";

export const extractTextFromPDF = async (filePath) => {
  try {
    let buffer;

    // Cloudinary returns a URL, local dev returns a file path
    if (filePath.startsWith("http")) {
      const response = await axios.get(filePath, {
        responseType: "arraybuffer",
      });
      buffer = Buffer.from(response.data);
    } else {
      buffer = fs.readFileSync(filePath);
    }

    const data = await pdfParse(buffer);
    return data.text?.trim() || "";
  } catch (err) {
    console.error("PDF parse error:", err.message);
    return "";
  }
};
