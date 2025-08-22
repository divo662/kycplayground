import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  try {
    // Check environment variables
    const hasApiKey = !!process.env.APPWRITE_API_KEY;
    const hasWebhookSecret = !!process.env.WEBHOOK_SECRET;
    
    // Get Appwrite configuration
    const appwriteEndpoint = config.appwrite.endpoint;
    const projectId = config.appwrite.projectId;
    
    // Get database collections
    const databaseCollections = Object.values(config.appwrite.database.collections);
    
    // Get storage buckets
    const storageBuckets = Object.values(config.appwrite.storage.buckets);
    
    return NextResponse.json({
      nodeEnv: process.env.NODE_ENV || 'development',
      appwriteEndpoint,
      projectId,
      hasApiKey,
      hasWebhookSecret,
      databaseCollections,
      storageBuckets,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Environment health check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check environment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
