const required = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLIENT_URL',
  'GROQ_API_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
]

const optional = [
  'REDIS_URL',
  'PINECONE_API_KEY',
  'PINECONE_INDEX',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'SMTP_HOST',
]

export const validateEnv = () => {
  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:')
    missing.forEach(key => console.error(`   - ${key}`))
    console.error('\nCopy server/.env.example to server/.env and fill in the values.\n')
    process.exit(1)
  }

  const missingOptional = optional.filter(key => !process.env[key])
  if (missingOptional.length > 0) {
    console.warn('\n⚠️  Optional environment variables not set:')
    missingOptional.forEach(key => console.warn(`   - ${key} (some features may not work)`))
    console.warn('')
  }

  console.log('✅ Environment variables validated')
}