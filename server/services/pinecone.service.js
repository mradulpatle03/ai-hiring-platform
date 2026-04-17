import { Pinecone } from '@pinecone-database/pinecone'
import dotenv from 'dotenv'
dotenv.config()
const INDEX = process.env.PINECONE_INDEX || 'hiring-platform'
const PINECONE_API_KEY = process.env.PINECONE_API_KEY

let pc = null

const isPineconeEnabled = () => Boolean(PINECONE_API_KEY)

const getClient = () => {
  if (!isPineconeEnabled()) return null

  if (!pc) {
    pc = new Pinecone({ apiKey: PINECONE_API_KEY })
  }

  return pc
}

// ===== INIT INDEX =====
export const initPinecone = async () => {
  if (!isPineconeEnabled()) {
    console.warn('PINECONE_API_KEY not set. Vector search is disabled.')
    return
  }

  const client = getClient()
  const existing = await client.listIndexes()
  const names = existing.indexes?.map(i => i.name) || []

  if (!names.includes(INDEX)) {
    await pc.createIndex({
      name: INDEX,
      dimension: 3072, // ✅ Gemini embedding
      metric: 'cosine',
      spec: { serverless: { cloud: 'aws', region: 'us-east-1' } }
    })
    console.log('Pinecone index created:', INDEX)
  } else {
    console.log('Pinecone index ready:', INDEX)
  }
}

const getIndex = () => {
  const client = getClient()
  return client ? client.index(INDEX) : null
}

// ===== UPSERT JOB =====
export const upsertJobEmbedding = async (id, embedding, metadata) => {
  try {
    const index = getIndex()
    if (!index) return false

    if (!embedding || embedding.length !== 3072) {
      throw new Error("Invalid embedding");
    }

    await index.upsert({
      records: [
        {
          id,
          values: embedding,
          metadata: {
            type: 'job', // ✅ important for filtering
            ...metadata,
          },
        },
      ],
    });

    console.log(`✅ Job stored in Pinecone: ${id}`);
    return true
  } catch (err) {
    console.error("❌ Pinecone upsert failed:", err.message);
    throw err;
  }
};

// ===== UPSERT RESUME =====
export const upsertResumeEmbedding = async (resumeId, embedding, metadata = {}) => {
  const index = getIndex()
  if (!index) return false

  await index.upsert({
    records: [
      {
        id: `resume_${resumeId}`,
        values: embedding,
        metadata: {
          type: 'resume',
          ...metadata,
        },
      },
    ],
  });

  return true
};

// ===== QUERY RESUMES =====
export const findSimilarResumes = async (jobEmbedding, topK = 10) => {
  const index = getIndex()
  if (!index) return []

  const results = await index.query({
    vector: jobEmbedding,
    topK,
    filter: { type: { $eq: 'resume' } },
    includeMetadata: true,
  });

  return results.matches;
};

// ===== QUERY JOBS =====
export const findSimilarJobs = async (resumeEmbedding, topK = 5) => {
  const index = getIndex()
  if (!index) return []

  const results = await index.query({
    vector: resumeEmbedding,
    topK,
    filter: { type: { $eq: 'job' } },
    includeMetadata: true,
  });

  return results.matches;
};

// ===== DELETE =====
export const deleteVector = async (id) => {
  const index = getIndex()
  if (!index) return false

  await index.deleteOne(id);
  return true
};
