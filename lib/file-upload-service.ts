import { storage, databases, DATABASE_ID, DOCUMENTS_COLLECTION_ID, DOCUMENTS_BUCKET_ID } from './appwrite-service'
import { ID, Query } from 'appwrite'
import { UserProfile } from '@/types'

export interface UploadedFile {
  $id: string
  fileName: string
  fileSize: number
  fileType: string
  fileUrl: string
  documentType: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'bank_statement' | 'face_photo' | 'face_video' | 'id_document'
  userId: string
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed'
  uploadProgress?: number
  error?: string
  createdAt: Date
  updatedAt: Date
}

export interface UploadResult {
  success: boolean
  file?: UploadedFile
  error?: string
  uploadId?: string
}

export class FileUploadService {
  // Upload file to Appwrite Storage
  static async uploadFile(
    file: File,
    documentType: string,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      // Generate unique file ID
      const fileId = ID.unique()
      const fileName = `${fileId}_${file.name}`
      
      // Create file record in database first
      const fileRecord: Omit<UploadedFile, '$id' | 'createdAt' | 'updatedAt'> = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: '', // Will be updated after upload
        documentType: documentType as any,
        userId,
        status: 'uploading'
      }

      // Create document record
      const documentRecord = await databases.createDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        ID.unique(),
        {
          ...fileRecord,
          metadata: JSON.stringify({ sessionId, documentType }),
          uploadedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      )

      // Upload file to Appwrite Storage
      const uploadResult = await storage.createFile(
        DOCUMENTS_BUCKET_ID,
        fileId,
        file
      )

      // Get file URL
      const fileUrl = storage.getFileView(DOCUMENTS_BUCKET_ID, fileId)

      // Update document record with file URL and status
      const updatedRecord = await databases.updateDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        documentRecord.$id,
        {
          fileUrl,
          status: 'uploaded',
          updatedAt: new Date().toISOString()
        }
      )

      // Simulate processing progress
      if (onProgress) {
        onProgress(100)
      }

      // Return success result
      return {
        success: true,
        file: {
          $id: updatedRecord.$id,
          fileName: updatedRecord.fileName,
          fileSize: updatedRecord.fileSize,
          fileType: updatedRecord.fileType,
          fileUrl: updatedRecord.fileUrl,
          documentType: updatedRecord.documentType,
          userId: updatedRecord.userId,
          status: updatedRecord.status,
          createdAt: new Date(updatedRecord.createdAt),
          updatedAt: new Date(updatedRecord.updatedAt)
        }
      }

    } catch (error: any) {
      console.error('File upload error:', error)
      
      return {
        success: false,
        error: error.message || 'Failed to upload file'
      }
    }
  }

  // Upload file and associate it with a verification session
  static async uploadFileForSession(
    file: File,
    documentType: UploadedFile['documentType'],
    userId: string,
    sessionId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      const fileId = ID.unique()
             const fileRecord: any = {
         fileName: file.name,
         fileSize: file.size,
         mimeType: file.type, // Use mimeType instead of fileType
         fileUrl: '',
         documentType,
         sessionId,
         userId,
         status: 'uploading'
       }

             const documentRecord = await databases.createDocument(
         DATABASE_ID,
         DOCUMENTS_COLLECTION_ID,
         ID.unique(),
         {
           ...fileRecord,
           type: 'document', // Add required type field
           uploadedAt: new Date().toISOString(), // Add required uploadedAt field
           createdAt: new Date().toISOString(),
           updatedAt: new Date().toISOString()
         }
       )

      await storage.createFile(
        DOCUMENTS_BUCKET_ID,
        fileId,
        file
      )

      const fileUrl = storage.getFileView(DOCUMENTS_BUCKET_ID, fileId)

      const updatedRecord = await databases.updateDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        documentRecord.$id,
        {
          fileUrl,
          status: 'uploaded',
          updatedAt: new Date().toISOString()
        }
      )

      if (onProgress) onProgress(100)

      return {
        success: true,
        file: {
          $id: updatedRecord.$id,
          fileName: updatedRecord.fileName,
          fileSize: updatedRecord.fileSize,
          fileType: updatedRecord.fileType,
          fileUrl: updatedRecord.fileUrl,
          documentType: updatedRecord.documentType,
          userId: updatedRecord.userId,
          status: updatedRecord.status,
          createdAt: new Date(updatedRecord.createdAt),
          updatedAt: new Date(updatedRecord.updatedAt)
        }
      }
    } catch (error: any) {
      console.error('File upload (session) error:', error)
      return { success: false, error: error.message || 'Failed to upload file' }
    }
  }

  // Get user's uploaded files
  static async getUserFiles(userId: string): Promise<UploadedFile[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt'),
          Query.limit(100)
        ]
      )

      return result.documents.map(doc => ({
        $id: doc.$id,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        fileUrl: doc.fileUrl,
        documentType: doc.documentType,
        userId: doc.userId,
        status: doc.status,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt)
      }))
    } catch (error: any) {
      console.error('Error getting user files:', error)
      throw new Error(error.message || 'Failed to get user files')
    }
  }

  // Delete file from storage and database
  static async deleteFile(fileId: string): Promise<boolean> {
    try {
      // Get file record first
      const fileRecord = await databases.getDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        fileId
      )

      // Delete from Appwrite Storage
      if (fileRecord.fileUrl) {
        const fileIdFromUrl = fileRecord.fileUrl.split('/').pop()
        if (fileIdFromUrl) {
          await storage.deleteFile(DOCUMENTS_BUCKET_ID, fileIdFromUrl)
        }
      }

      // Delete from database
      await databases.deleteDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        fileId
      )

      return true
    } catch (error: any) {
      console.error('Error deleting file:', error)
      throw new Error(error.message || 'Failed to delete file')
    }
  }

  // Update file status
  static async updateFileStatus(fileId: string, status: UploadedFile['status'], error?: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        fileId,
        {
          status,
          error,
          updatedAt: new Date().toISOString()
        }
      )
    } catch (error: any) {
      console.error('Error updating file status:', error)
      throw new Error(error.message || 'Failed to update file status')
    }
  }

  // Get file by ID
  static async getFile(fileId: string): Promise<UploadedFile | null> {
    try {
      const fileRecord = await databases.getDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        fileId
      )

      return {
        $id: fileRecord.$id,
        fileName: fileRecord.fileName,
        fileSize: fileRecord.fileSize,
        fileType: fileRecord.fileType,
        fileUrl: fileRecord.fileUrl,
        documentType: fileRecord.documentType,
        userId: fileRecord.userId,
        status: fileRecord.status,
        createdAt: new Date(fileRecord.createdAt),
        updatedAt: new Date(fileRecord.updatedAt)
      }
    } catch (error: any) {
      console.error('Error getting file:', error)
      return null
    }
  }

  // Validate file before upload
  static validateFile(file: File, maxSize: number = 10 * 1024 * 1024): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${this.formatFileSize(maxSize)}`
      }
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
      'video/webm',
      'video/mp4'
    ]

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, WebP, PDF, and short video files are allowed'
      }
    }

    return { valid: true }
  }

  // Format file size
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
