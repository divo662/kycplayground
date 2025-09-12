// Configuration with environment variables
export const config = {
  appwrite: {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'default-project',
    apiKey: process.env.APPWRITE_API_KEY || 'default-api-key', // Server-side only
    database: {
      id: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kycplayground',
      collections: {
        users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || 'users',
        documents: process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTS_COLLECTION_ID || 'documents',
        verifications: process.env.NEXT_PUBLIC_APPWRITE_VERIFICATIONS_COLLECTION_ID || 'verifications',
        verificationSessions: 'verification_sessions',  // Add this collection
        apiKeys: process.env.NEXT_PUBLIC_APPWRITE_API_KEYS_COLLECTION_ID || 'collection-api_keys',
        webhooks: 'webhooks',
        webhookConfigs: 'webhook_configs',
      },
      bucket: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'documents',
      functions: {
        verify: process.env.NEXT_PUBLIC_APPWRITE_VERIFY_FUNCTION_ID || 'verify_document',
      },
    },
    storage: {
      buckets: {
        documents: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'documents',
        avatars: 'avatars',
      },
    },
  },
  app: {
    url: 'https://kycplayground.vercel.app',
    name: process.env.NEXT_PUBLIC_APP_NAME || 'KYCPlayground',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    env: process.env.NODE_ENV || 'development',
  },
  features: {
    registration: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'true',
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    notifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
    payments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
  },
  mock: {
    enableRandomDelays: process.env.NEXT_PUBLIC_MOCK_ENABLE_RANDOM_DELAYS === 'true',
    processingTime: parseInt(process.env.NEXT_PUBLIC_MOCK_PROCESSING_TIME || '2000'),
    successRate: parseFloat(process.env.NEXT_PUBLIC_MOCK_SUCCESS_RATE || '0.85'),
  },
  security: {
    customKey: process.env.CUSTOM_SECURITY_KEY,
    jwtSecret: process.env.JWT_SECRET,
    encryptionKey: process.env.ENCRYPTION_KEY,
  },
  cors: {
    origins: [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://127.0.0.1:5500', 
      'http://localhost:8080',
      'http://localhost:8000',  // Added for FinFlow app
      'https://kycplayground.vercel.app'  // Production domain
    ],
  },
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : undefined,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
  },
  payments: {
    flutterwavePublicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
    flutterwaveSecretKey: process.env.FLUTTERWAVE_SECRET_KEY,
  },
}

// Utility functions
export function logConfig() {
  if (config.app.env === 'development') {
    console.log('🔧 Configuration loaded:', {
      app: config.app,
      features: config.features,
      mock: config.mock,
      appwrite: {
        endpoint: config.appwrite.endpoint,
        projectId: config.appwrite.projectId,
        database: {
          id: config.appwrite.database.id,
          collections: Object.keys(config.appwrite.database.collections),
          bucket: config.appwrite.database.bucket
        }
      }
    })
  }
}

export function isFeatureEnabled(feature: keyof typeof config.features): boolean {
  return config.features[feature]
}

export function getCorsOrigins(): string[] {
  return config.cors.origins
}

// Initialize configuration and log
logConfig() 