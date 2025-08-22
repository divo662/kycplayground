// User roles
export type UserRole = 'user' | 'admin' | 'developer'

// User status
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending'

// User interface
export interface User {
  $id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  avatar?: string
  company?: string
  phone?: string
  country?: string
  timezone?: string
  preferences: {
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
    theme: 'light' | 'dark' | 'system'
    language: string
  }
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

// User registration request
export interface RegisterRequest {
  email: string
  password: string
  name: string
  company?: string
  phone?: string
  country?: string
  acceptTerms: boolean
  marketingEmails?: boolean
}

// User login request
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

// User profile update
export interface UpdateProfileRequest {
  name?: string
  company?: string
  phone?: string
  country?: string
  avatar?: string
  preferences?: Partial<User['preferences']>
}

// User password change
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// User preferences
export interface UserPreferences {
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
}



// User session
export interface UserSession {
  $id: string
  userId: string
  token: string
  device: {
    type: 'web' | 'mobile' | 'desktop'
    browser?: string
    os?: string
    ip?: string
  }
  isActive: boolean
  createdAt: Date
  expiresAt: Date
  lastActivityAt: Date
}

// User activity log
export interface UserActivity {
  $id: string
  userId: string
  action: string
  resource?: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

// User statistics
export interface UserStats {
  totalVerifications: number
  successfulVerifications: number
  failedVerifications: number
  totalDocuments: number
  lastActivity: Date
  averageConfidence: number
  successRate: number
}

// Team/Organization (for future multi-tenant support)
export interface Organization {
  $id: string
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  industry?: string
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  settings: {
    maxUsers: number
    maxVerifications: number
    features: string[]
  }
  createdAt: Date
  updatedAt: Date
}

// Organization member
export interface OrganizationMember {
  $id: string
  organizationId: string
  userId: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  permissions: string[]
  joinedAt: Date
  invitedBy?: string
} 