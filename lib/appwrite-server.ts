import { Client, Databases, Storage, Functions, ID, Query } from 'node-appwrite';
import { config } from './config'

// Initialize Appwrite client for server-side operations
const client = new Client()

client
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId)
  .setKey(config.appwrite.apiKey || process.env.APPWRITE_API_KEY || '')

// Initialize services
export const databases = new Databases(client)
export const storage = new Storage(client)
export const functions = new Functions(client)

// Database and collection IDs
export const DATABASE_ID = config.appwrite.database.id
export const USERS_COLLECTION_ID = config.appwrite.database.collections.users
export const DOCUMENTS_COLLECTION_ID = config.appwrite.database.collections.documents
export const VERIFICATIONS_COLLECTION_ID = config.appwrite.database.collections.verifications
export const WEBHOOKS_COLLECTION_ID = config.appwrite.database.collections.webhooks
export const API_KEYS_COLLECTION_ID = config.appwrite.database.collections.apiKeys

// Storage bucket IDs
export const DOCUMENTS_BUCKET_ID = config.appwrite.database.bucket

// Function IDs
export const VERIFY_DOCUMENT_FUNCTION_ID = config.appwrite.database.functions.verify

export { client }
