import { Client, Account, Databases, Storage, Functions, ID, Query } from 'appwrite';
import type { Models } from 'appwrite'
import { config } from './config'
import { UserProfile } from '@/types'

// Initialize Appwrite client for client-side operations
const client = new Client()

client
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId)

// Initialize services
export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const functions = new Functions(client)

// Database and collection IDs
export const DATABASE_ID = config.appwrite.database.id
export const USERS_COLLECTION_ID = config.appwrite.database.collections.users
export const DOCUMENTS_COLLECTION_ID = config.appwrite.database.collections.documents
export const VERIFICATIONS_COLLECTION_ID = config.appwrite.database.collections.verifications
export const WEBHOOKS_COLLECTION_ID = config.appwrite.database.collections.webhooks

// Storage bucket IDs
export const DOCUMENTS_BUCKET_ID = config.appwrite.database.bucket

// Function IDs
export const VERIFY_DOCUMENT_FUNCTION_ID = config.appwrite.database.functions.verify

export { client }

// Database optimization utilities
export class DatabaseOptimizer {
  // Cache for frequently accessed data
  public static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  // Cache TTL in milliseconds (5 minutes)
  private static readonly CACHE_TTL = 5 * 60 * 1000
  
  // Generate a robust unique ID
  static generateUniqueId(): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    return `${timestamp}_${randomString}`
  }
  
  // Get cached data
  static getCached<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data as T
  }
  
  // Set cached data
  static setCached<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }
  
  // Clear cache
  static clearCache(): void {
    this.cache.clear()
  }
  
  // Clear expired cache entries
  static cleanupCache(): void {
    const now = Date.now()
    for (const [key, value] of Array.from(this.cache.entries())) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key)
      }
    }
  }
  
  // Optimized query with pagination
  static async optimizedQuery<T extends Models.Document>(
    collectionId: string,
    queries: string[] = [],
    limit: number = 25,
    offset: number = 0
  ): Promise<{ documents: T[]; total: number }> {
    const cacheKey = `query:${collectionId}:${JSON.stringify(queries)}:${limit}:${offset}`
    
    // Try to get from cache first
    const cached = this.getCached<{ documents: T[]; total: number }>(cacheKey)
    if (cached) {
      return cached
    }
    
    try {
      const builtQueries: string[] = [...queries]
      if (typeof limit === 'number') builtQueries.push(Query.limit(limit))
      if (typeof offset === 'number' && offset > 0) builtQueries.push(Query.offset(offset))

      const result = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        builtQueries
      )
      
      const response = {
        documents: result.documents as unknown as T[],
        total: (result as any).total ?? (Array.isArray(result.documents) ? result.documents.length : 0)
      }
      
      // Cache the result
      this.setCached(cacheKey, response)
      
      return response
    } catch (error) {
      console.error('Error in optimized query:', error)
      throw error
    }
  }
}

// Data validation utilities
export class DataValidator {
  // Validate user data
  static validateUserData(data: any): boolean {
    return data && typeof data === 'object' && data.email && data.name
  }
  
  // Validate document data
  static validateDocumentData(data: any): boolean {
    return data && typeof data === 'object' && data.type && data.userId
  }
  
  // Validate verification data
  static validateVerificationData(data: any): boolean {
    return data && typeof data === 'object' && data.documentId && data.userId
  }
  
  // Sanitize data for database storage
  static sanitizeData(data: any): any {
    const sanitized: any = {}
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        if (typeof value === 'string') {
          sanitized[key] = value.trim()
        } else if (value instanceof Date) {
          sanitized[key] = value.toISOString()
        } else {
          sanitized[key] = value
        }
      }
    }
    
    return sanitized
  }
}

// Authentication service
export class AuthService {
  // Bind Appwrite account instance for static usage
  private static account = account
  // Create new account
  static async createAccount(email: string, password: string, name: string) {
    try {
      // Create account
      const account = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      )
      
      // Sign in to verify account creation
      await this.account.createEmailSession(email, password)
      
      // Create user profile
      await this.createUserProfile(account.$id, email, name)
      
      return account
    } catch (error: any) {
      console.error('Error creating account:', error)
      throw new Error(error.message || 'Failed to create account')
    }
  }
  
  // Sign in
  static async signIn(email: string, password: string) {
    try {
      const session = await this.account.createEmailSession(email, password)
      
      // Get user profile
      const user = await this.getCurrentUser()
      
      return { session, user }
    } catch (error: any) {
      console.error('Error signing in:', error)
      throw new Error(error.message || 'Failed to sign in')
    }
  }
  
  // Sign out
  static async signOut() {
    try {
      await this.account.deleteSessions()
      return { success: true }
    } catch (error: any) {
      console.error('Error signing out:', error)
      throw new Error(error.message || 'Failed to sign out')
    }
  }
  
  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.account.get()
      return !!session.$id
    } catch (error) {
      return false
    }
  }
  
  // Get current user
  static async getCurrentUser() {
    try {
      const account = await this.account.get()
      
      // Get user profile from database
      const userProfile = await this.getUserProfile(account.$id)
      
      return {
        ...account,
        profile: userProfile
      }
    } catch (error: any) {
      console.error('Error getting current user:', error)
      throw new Error(error.message || 'Failed to get current user')
    }
  }
  
  // Create user profile
  private static async createUserProfile(userId: string, email: string, name: string) {
    try {
      const profileData = {
        userId,
        email,
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const sanitizedData = DataValidator.sanitizeData(profileData)
      
      const profile = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        sanitizedData
      )
      
      return profile
    } catch (error: any) {
      console.error('Error creating user profile:', error)
      throw new Error(error.message || 'Failed to create user profile')
    }
  }
  
  // Get user profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      )
      
      if (result.documents.length === 0) {
        return null
      }
      
      return result.documents[0] as unknown as UserProfile
    } catch (error: any) {
      console.error('Error getting user profile:', error)
      return null
    }
  }
}

// Document service
export class DocumentService {
  // Upload document
  static async uploadDocument(file: File, type: string, userId: string) {
    try {
      // Upload file to storage
      const uploadedFile = await storage.createFile(
        DOCUMENTS_BUCKET_ID,
        ID.unique(),
        file
      )
      
      // Create document record in database
      const documentData = {
        userId,
        fileId: uploadedFile.$id,
        type,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        status: 'uploaded',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const sanitizedData = DataValidator.sanitizeData(documentData)
      
      const document = await databases.createDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        ID.unique(),
        sanitizedData
      )
      
      return {
        document,
        file: uploadedFile
      }
    } catch (error: any) {
      console.error('Error uploading document:', error)
      throw new Error(error.message || 'Failed to upload document')
    }
  }
  
  // Get document
  static async getDocument(documentId: string) {
    try {
      const document = await databases.getDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        documentId
      )
      
      return document
    } catch (error: any) {
      console.error('Error getting document:', error)
      throw new Error(error.message || 'Failed to get document')
    }
  }
  
  // List user documents
  static async listUserDocuments(userId: string, limit: number = 25, offset: number = 0) {
    return DatabaseOptimizer.optimizedQuery(
      DOCUMENTS_COLLECTION_ID,
      [Query.equal('userId', userId)],
      limit,
      offset
    )
  }
  
  // Get file URL
  static getFileUrl(fileId: string) {
    return storage.getFileView(DOCUMENTS_BUCKET_ID, fileId)
  }
}

// Verification service
export class VerificationService {
  // Create verification
  static async createVerification(documentId: string, userId: string, options?: any) {
    try {
      const verificationData = {
        documentId,
        userId,
        status: 'pending',
        options: options ? JSON.stringify(options) : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const sanitizedData = DataValidator.sanitizeData(verificationData)
      
      const verification = await databases.createDocument(
        DATABASE_ID,
        VERIFICATIONS_COLLECTION_ID,
        ID.unique(),
        sanitizedData
      )
      
      // Process verification asynchronously
      this.processVerification(verification.$id)
      
      return verification
    } catch (error: any) {
      console.error('Error creating verification:', error)
      throw new Error(error.message || 'Failed to create verification')
    }
  }
  
  // Get verification
  static async getVerification(verificationId: string) {
    try {
      const verification = await databases.getDocument(
        DATABASE_ID,
        VERIFICATIONS_COLLECTION_ID,
        verificationId
      )
      
      return verification
    } catch (error: any) {
      console.error('Error getting verification:', error)
      throw new Error(error.message || 'Failed to get verification')
    }
  }
  
  // List user verifications
  static async listUserVerifications(userId: string, limit: number = 25, offset: number = 0) {
    return DatabaseOptimizer.optimizedQuery(
      VERIFICATIONS_COLLECTION_ID,
      [Query.equal('userId', userId)],
      limit,
      offset
    )
  }
  
  // Process verification (simulate AI processing)
  private static async processVerification(verificationId: string) {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update verification status
      const updates = {
        status: 'completed',
        result: {
          confidence: 0.95,
          extractedInfo: {
            name: 'John Doe',
            documentType: 'ID Card',
            documentNumber: '123456789'
          }
        },
        updatedAt: new Date().toISOString()
      }
      
      const sanitizedData = DataValidator.sanitizeData(updates)
      
      await databases.updateDocument(
        DATABASE_ID,
        VERIFICATIONS_COLLECTION_ID,
        verificationId,
        sanitizedData
      )
    } catch (error: any) {
      console.error('Error processing verification:', error)
      
      // Update verification status to failed
      const updates = {
        status: 'failed',
        error: error.message,
        updatedAt: new Date().toISOString()
      }
      
      const sanitizedData = DataValidator.sanitizeData(updates)
      
      try {
        await databases.updateDocument(
          DATABASE_ID,
          VERIFICATIONS_COLLECTION_ID,
          verificationId,
          sanitizedData
        )
      } catch (updateError) {
        console.error('Error updating verification status:', updateError)
      }
    }
  }
}

// User service
export class UserService {
  // Get user profile (with caching)
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const cacheKey = `user:${userId}`
    
    // Try to get from cache first
    const cached = DatabaseOptimizer.getCached<UserProfile>(cacheKey)
    if (cached) return cached
    
    try {
      const profile = await AuthService.getUserProfile(userId)
      
      if (profile) {
        // Cache the result
        DatabaseOptimizer.setCached(cacheKey, profile)
      }
      
      return profile
    } catch (error: any) {
      console.error('Error getting user profile:', error)
      return null
    }
  }
  
  // Update user profile
  static async updateUserProfile(userId: string, updates: any) {
    try {
      const profile = await this.getUserProfile(userId)
      if (!profile) {
        throw new Error('User profile not found')
      }
      
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      const sanitizedData = DataValidator.sanitizeData(updatedData)
      
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        profile.$id,
        sanitizedData
      )
      
      // Clear cache
      DatabaseOptimizer.cache.delete(`user:${userId}`)
      
      return updatedProfile
    } catch (error: any) {
      console.error('Error updating user profile:', error)
      throw new Error(error.message || 'Failed to update user profile')
    }
  }
}

// Initialize cache cleanup
setInterval(() => {
  DatabaseOptimizer.cleanupCache()
}, 5 * 60 * 1000) // Clean up every 5 minutes 