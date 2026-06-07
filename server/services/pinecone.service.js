// In-memory vector store — replaces Pinecone
// Stored in a Map: id → { vector, metadata }
const vectorStore = new Map()

// Cosine similarity between two vectors
const cosineSimilarity = (a, b) => {
  if (a.length !== b.length) return 0
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  const mag = Math.sqrt(magA) * Math.sqrt(magB)
  return mag === 0 ? 0 : dot / mag
}

export const initPinecone = async () => {
  console.log('Vector store ready (in-memory mode)')
}

export const upsertJobEmbedding = async (jobId, embedding, metadata = {}) => {
  vectorStore.set(`job_${jobId}`, { vector: embedding, metadata: { type: 'job', ...metadata } })
}

export const upsertResumeEmbedding = async (resumeId, embedding, metadata = {}) => {
  vectorStore.set(`resume_${resumeId}`, { vector: embedding, metadata: { type: 'resume', ...metadata } })
}

export const findSimilarResumes = async (queryEmbedding, topK = 10) => {
  const results = []
  for (const [id, entry] of vectorStore.entries()) {
    if (entry.metadata.type !== 'resume') continue
    const score = cosineSimilarity(queryEmbedding, entry.vector)
    results.push({ id, score, metadata: entry.metadata })
  }
  return results.sort((a, b) => b.score - a.score).slice(0, topK)
}

export const findSimilarJobs = async (queryEmbedding, topK = 5) => {
  const results = []
  for (const [id, entry] of vectorStore.entries()) {
    if (entry.metadata.type !== 'job') continue
    const score = cosineSimilarity(queryEmbedding, entry.vector)
    results.push({ id, score, metadata: entry.metadata })
  }
  return results.sort((a, b) => b.score - a.score).slice(0, topK)
}

export const deleteVector = async (id) => {
  vectorStore.delete(id)
}