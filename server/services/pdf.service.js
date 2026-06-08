import pdfParseFork from 'pdf-parse-fork'

// Parse PDF from a Buffer — used when Multer gives us the file in memory
export const extractTextFromBuffer = async (buffer) => {
  try {
    if (!buffer || buffer.length === 0) {
      console.error('PDF parse error: empty buffer')
      return ''
    }
    const data = await pdfParseFork(buffer)
    return data.text?.trim() || ''
  } catch (err) {
    console.error('PDF parse error (buffer):', err.message)
    return ''
  }
}