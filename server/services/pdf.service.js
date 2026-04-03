import fs from 'fs'
import pdfParse from '@cedrugs/pdf-parse'

export const extractTextFromPDF = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath)
    const data = await pdfParse(buffer)
    return data.text?.trim() || ''
  } catch (err) {
    console.error('PDF parse error:', err.message)
    return ''
  }
}