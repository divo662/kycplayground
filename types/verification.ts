// Document types
export type DocumentType = 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'bank_statement'

// Verification status
export type VerificationStatus = 'pending' | 'processing' | 'verified' | 'failed' | 'rejected'

// Document interface
export interface Document {
  $id: string
  userId: string
  type: DocumentType
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  status: 'pending' | 'processed' | 'failed'
  uploadedAt: Date
  processedAt?: Date
  metadata?: {
    country?: string
    documentNumber?: string
    expiryDate?: string
    issueDate?: string
  }
}

// Verification interface
export interface Verification {
  $id: string
  userId: string
  documentId: string
  status: VerificationStatus
  confidence: number
  processingTime: number
  mockData: {
    faceMatch: number
    documentValid: boolean
    ocrText: string
    extractedData: {
      firstName?: string
      lastName?: string
      dateOfBirth?: string
      documentNumber?: string
      nationality?: string
      expiryDate?: string
    }
    fraudScore: number
    livenessScore: number
  }
  createdAt: Date
  completedAt?: Date
  notes?: string
}

// Verification request
export interface VerificationRequest {
  documentId: string
  userId: string
  documentType: DocumentType
  options?: {
    enableFaceMatch?: boolean
    enableOCR?: boolean
    enableFraudCheck?: boolean
    enableLivenessCheck?: boolean
  }
}

// Verification response
export interface VerificationResponse {
  success: boolean
  verificationId: string
  status: VerificationStatus
  confidence: number
  processingTime: number
  results: {
    faceMatch: number
    documentValid: boolean
    ocrText: string
    fraudScore: number
    livenessScore: number
  }
  message?: string
  error?: string
}

// Mock verification settings
export interface MockVerificationSettings {
  successRate: number // 0-1
  averageProcessingTime: number // milliseconds
  enableRandomDelays: boolean
  enableRealisticErrors: boolean
  errorTypes: ('ocr_failed' | 'face_match_failed' | 'document_invalid' | 'fraud_detected')[]
}

// Verification analytics
export interface VerificationAnalytics {
  totalVerifications: number
  successfulVerifications: number
  failedVerifications: number
  averageConfidence: number
  averageProcessingTime: number
  successRate: number
  byDocumentType: Record<DocumentType, {
    count: number
    successRate: number
    averageConfidence: number
  }>
  byStatus: Record<VerificationStatus, number>
  recentActivity: {
    date: string
    count: number
    successRate: number
  }[]
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: Date
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
} 