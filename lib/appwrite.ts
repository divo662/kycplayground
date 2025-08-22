import { Client, Account, Databases, Storage, Functions } from 'appwrite'

// Appwrite configuration with hardcoded working credentials
const client = new Client()

// Debug environment variables in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Appwrite Configuration (Hardcoded):')
  console.log('Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'Not set')
  console.log('Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'Not set')
  console.log('Database ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'Not set')
}

// Use environment variables for configuration
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1'
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kycplayground'

if (!projectId) {
  console.error('❌ NEXT_PUBLIC_APPWRITE_PROJECT_ID environment variable not set')
  throw new Error('Appwrite project ID not configured')
}

console.log('✅ Using hardcoded Appwrite configuration')

client
  .setEndpoint(endpoint)
  .setProject(projectId)

// Initialize Appwrite services
export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const functions = new Functions(client)

// Database and collection IDs
export const DATABASE_ID = 'kycplayground'
export const USERS_COLLECTION_ID = 'users'
export const DOCUMENTS_COLLECTION_ID = 'documents'
export const VERIFICATIONS_COLLECTION_ID = 'verifications'

// Storage bucket IDs
export const DOCUMENTS_BUCKET_ID = 'documents'

// Function IDs
export const VERIFY_DOCUMENT_FUNCTION_ID = 'verify_document'

export { client } 