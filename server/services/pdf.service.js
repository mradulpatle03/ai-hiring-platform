import pdfParse from "@cedrugs/pdf-parse";
import fs from "fs";
import axios from "axios";

export const extractTextFromPDF = async (filePath) => {
  try {
    let buffer;
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
