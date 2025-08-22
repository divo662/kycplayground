import { NextRequest, NextResponse } from 'next/server'
import { Client, Databases, Storage, ID } from 'node-appwrite'
import { config } from '@/lib/config'

// Initialize client with API key for server-side operations
const client = new Client()

client
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId)

// Set API key for server-side operations
if (config.appwrite.apiKey) {
  client.setKey(config.appwrite.apiKey)
}

const databases = new Databases(client)
const storage = new Storage(client)

const DATABASE_ID = config.appwrite.database.id

export async function POST(request: NextRequest) {
  try {
    const results: string[] = []

    // Step 1: Create Database
    try {
      await databases.create(DATABASE_ID, 'KYCPlayground')
      results.push('✅ Database created successfully')
    } catch (error: any) {
      if (error.code === 409) {
        results.push('ℹ️ Database already exists')
      } else {
        throw error
      }
    }

    // Step 2: Create Collections
    const collections = [
      {
        id: 'users',
        name: 'Users',
        attributes: [
          { key: 'userId', type: 'string', size: 100, required: true },
          { key: 'email', type: 'string', size: 255, required: true },
          { key: 'name', type: 'string', size: 255, required: true },
          { key: 'role', type: 'string', size: 50, required: true },
          { key: 'status', type: 'string', size: 50, required: true },
          { key: 'company', type: 'string', size: 255, required: false },
          { key: 'phone', type: 'string', size: 50, required: false },
          { key: 'country', type: 'string', size: 100, required: false },
          { key: 'plan', type: 'string', size: 50, required: true },
          { key: 'apiUsage', type: 'string', size: 1000, required: false },
          { key: 'createdAt', type: 'datetime', required: true },
          { key: 'updatedAt', type: 'datetime', required: true }
        ]
      },
      {
        id: 'documents',
        name: 'Documents',
        attributes: [
          { key: 'userId', type: 'string', size: 100, required: true },
          { key: 'type', type: 'string', size: 50, required: true },
          { key: 'fileName', type: 'string', size: 255, required: true },
          { key: 'fileUrl', type: 'string', size: 500, required: true },
          { key: 'fileSize', type: 'integer', required: true },
          { key: 'mimeType', type: 'string', size: 100, required: true },
          { key: 'status', type: 'string', size: 50, required: true },
          { key: 'metadata', type: 'string', size: 5000, required: false },
          { key: 'uploadedAt', type: 'datetime', required: true },
          { key: 'processedAt', type: 'datetime', required: false }
        ]
      },
      {
        id: 'verifications',
        name: 'Verifications',
        attributes: [
          { key: 'userId', type: 'string', size: 100, required: true },
          { key: 'documentId', type: 'string', size: 100, required: true },
          { key: 'status', type: 'string', size: 50, required: true },
          { key: 'confidence', type: 'float', required: true },
          { key: 'processingTime', type: 'integer', required: true },
          { key: 'mockData', type: 'string', size: 10000, required: true },
          { key: 'webhookUrl', type: 'string', size: 500, required: false },
          { key: 'webhookSent', type: 'boolean', required: false },
          { key: 'createdAt', type: 'datetime', required: true },
          { key: 'completedAt', type: 'datetime', required: false }
        ]
      },

      {
        id: 'webhooks',
        name: 'Webhooks',
        attributes: [
          { key: 'userId', type: 'string', size: 100, required: true },
          { key: 'url', type: 'string', size: 500, required: true },
          { key: 'events', type: 'string', size: 1000, required: true },
          { key: 'isActive', type: 'boolean', required: true },
          { key: 'secret', type: 'string', size: 255, required: true },
          { key: 'lastTriggeredAt', type: 'datetime', required: false },
          { key: 'createdAt', type: 'datetime', required: true }
        ]
      }
    ]

    for (const collection of collections) {
      console.log(`Creating ${collection.name} collection...`)
      
      // Create collection
      try {
        await databases.createCollection(DATABASE_ID, collection.id, collection.name)
        results.push(`✅ ${collection.name} collection created`)
      } catch (error: any) {
        if (error.code === 409) {
          results.push(`ℹ️ ${collection.name} collection already exists`)
        } else {
          results.push(`❌ Failed to create ${collection.name} collection: ${error.message}`)
          continue
        }
      }

      // Add a small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create attributes
      for (const attr of collection.attributes) {
        try {
          if (attr.type === 'string') {
            await databases.createStringAttribute(DATABASE_ID, collection.id, attr.key, attr.size || 255, attr.required)
          } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute(DATABASE_ID, collection.id, attr.key, attr.required)
          } else if (attr.type === 'float') {
            await databases.createFloatAttribute(DATABASE_ID, collection.id, attr.key, attr.required)
          } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute(DATABASE_ID, collection.id, attr.key, attr.required)
          } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(DATABASE_ID, collection.id, attr.key, attr.required)
          }
          console.log(`  ✅ Created ${attr.key} attribute`)
          
          // Small delay between attributes
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (error: any) {
          if (error.code === 409) {
            console.log(`  ℹ️ Attribute ${attr.key} already exists`)
          } else {
            console.error(`  ❌ Error creating ${attr.key}:`, error.message)
          }
        }
      }
    }

    // Step 3: Create Storage Bucket
    try {
      // Create bucket with minimal parameters to avoid type issues
      await storage.createBucket('documents', 'Documents')
      results.push('✅ Documents storage bucket created')
    } catch (error: any) {
      if (error.code === 409) {
        results.push('ℹ️ Documents storage bucket already exists')
      } else {
        results.push(`❌ Failed to create storage bucket: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: results.join('\n'),
      summary: {
        database: DATABASE_ID,
        collections: collections.map(c => c.id),
        storage: 'documents'
      }
    })

  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Setup failed. Make sure you have set APPWRITE_API_KEY in your .env.local file'
    }, { status: 500 })
  }
} 