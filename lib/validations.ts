import { z } from 'zod'

// User registration schema
export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  marketingEmails: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// User login schema
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

// Document upload schema
export const documentUploadSchema = z.object({
  type: z.enum(['passport', 'drivers_license', 'national_id', 'utility_bill', 'bank_statement']),
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type),
      'File must be a valid image (JPEG, PNG, WebP) or PDF'
    ),
  description: z.string().optional(),
})

// Verification request schema
export const verificationRequestSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  options: z.object({
    enableFaceMatch: z.boolean().optional(),
    enableOCR: z.boolean().optional(),
    enableFraudCheck: z.boolean().optional(),
    enableLivenessCheck: z.boolean().optional(),
  }).optional(),
})

// User profile update schema
export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  preferences: z.object({
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
    }).optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    language: z.string().optional(),
  }).optional(),
})

// Password change schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})



// Search and filter schema
export const searchFilterSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['pending', 'processing', 'verified', 'failed', 'rejected']).optional(),
  documentType: z.enum(['passport', 'drivers_license', 'national_id', 'utility_bill', 'bank_statement']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  company: z.string().optional(),
})

// Feedback schema
export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  category: z.enum(['bug', 'feature', 'improvement', 'general']),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  email: z.string().email('Please enter a valid email address').optional(),
})

// Settings schema
export const settingsSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  timeFormat: z.enum(['12h', '24h']),
})

// Export types
export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>
export type VerificationRequestFormData = z.infer<typeof verificationRequestSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

export type SearchFilterFormData = z.infer<typeof searchFilterSchema>
export type ContactFormData = z.infer<typeof contactSchema>
export type FeedbackFormData = z.infer<typeof feedbackSchema>
export type SettingsFormData = z.infer<typeof settingsSchema> 