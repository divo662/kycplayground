// User Types
export type UserRole = 'user' | 'admin' | 'developer'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface UserProfile {
  $id: string
  userId: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  company?: string
  phone?: string
  country?: string
  plan: string
  apiUsage?: {
    totalRequests: number
    monthlyRequests: number
    lastResetDate: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface User {
  $id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  company?: string
  phone?: string
  country?: string
  plan?: string
  apiUsage?: {
    totalRequests: number
    monthlyRequests: number
    lastResetDate: Date
  }
  createdAt: Date
  updatedAt: Date
}

// Document Types
export type DocumentType = 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'bank_statement'

export interface Document {
  $id: string
  userId: string
  type: DocumentType
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  status: 'pending' | 'processed' | 'failed'
  metadata?: string // JSON string containing document metadata
  uploadedAt: Date
  processedAt?: Date
}

// Verification Types
export type VerificationStatus = 'pending' | 'processing' | 'verified' | 'failed' | 'rejected'

export interface Verification {
  $id: string
  userId: string
  documentId: string
  status: VerificationStatus
  confidence: number
  processingTime: number
  mockData: string // JSON string containing verification data
  webhookUrl?: string
  webhookSent?: boolean
  createdAt: Date
  completedAt?: Date
}



// Webhook Types
export interface Webhook {
  $id: string
  userId: string
  url: string
  events: string[]
  isActive: boolean
  secret: string
  lastTriggeredAt?: Date
  createdAt: Date
}

// Form Types
export interface RegisterRequest {
  name: string
  email: string
  password: string
  company?: string
  phone?: string
  country?: string
  acceptTerms: boolean
  marketingEmails?: boolean
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface UpdateProfileRequest {
  name?: string
  company?: string
  phone?: string
  country?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Verification Request/Response Types
export interface VerificationRequest {
  documentId: string
  userId: string
  options?: {
    webhookUrl?: string
    priority?: 'low' | 'normal' | 'high'
  }
}

export interface VerificationResponse {
  verificationId: string
  status: VerificationStatus
  confidence: number
  processingTime: number
  mockData: string // JSON string containing verification data
}

// Mock Settings
export interface MockVerificationSettings {
  successRate: number
  averageProcessingTime: number
  enableRandomFailures: boolean
  enableSlowProcessing: boolean
}

// Analytics Types
export interface VerificationAnalytics {
  totalVerifications: number
  successRate: number
  averageProcessingTime: number
  verificationsByStatus: Record<VerificationStatus, number>
  verificationsByType: Record<DocumentType, number>
  dailyVerifications: Array<{
    date: string
    count: number
  }>
}

// User Activity Types
export interface UserActivity {
  $id: string
  userId: string
  action: string
  details: any
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

export interface UserStats {
  totalVerifications: number
  successRate: number
  totalDocuments: number
  lastActivity: Date
}

// Organization Types
export interface Organization {
  $id: string
  name: string
  domain?: string
  plan: string
  memberCount: number
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationMember {
  $id: string
  organizationId: string
  userId: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: Date
}

// User Preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    webhook: boolean
  }
  dashboard: {
    defaultView: 'overview' | 'verifications' | 'documents' | 'analytics'
    refreshInterval: number
  }
}

// Create API Key Request


// User Session
export interface UserSession {
  $id: string
  userId: string
  ipAddress: string
  userAgent: string
  createdAt: Date
  lastActivity: Date
  isActive: boolean
} 