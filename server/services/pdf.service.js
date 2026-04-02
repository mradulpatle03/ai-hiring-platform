import fs from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const pdfParseLib = require('pdf-parse')
const pdfParse = pdfParseLib.default || pdfParseLib

export const extractTextFromPDF = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath)
    const data   = await pdfParse(buffer)
    return data.text?.trim() || ''
  } catch (err) {
    console.error('PDF parse error:', err.message)
    return ''
  }
}