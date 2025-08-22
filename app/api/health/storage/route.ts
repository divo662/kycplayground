import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { Client, Storage } from 'node-appwrite';

export async function GET() {
  try {
    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId)
      .setKey(process.env.APPWRITE_API_KEY || '');

    const storage = new Storage(client);
    const requiredBuckets = [
      config.appwrite.storage.buckets.documents,
      config.appwrite.storage.buckets.avatars
    ];

    const accessibleBuckets: string[] = [];
    const inaccessibleBuckets: string[] = [];

    // Test each required bucket
    for (const bucketId of requiredBuckets) {
      try {
        await storage.getBucket(bucketId);
        accessibleBuckets.push(bucketId);
      } catch (error) {
        inaccessibleBuckets.push(bucketId);
        console.warn(`Bucket ${bucketId} not accessible:`, error);
      }
    }

    const status = inaccessibleBuckets.length === 0 ? 'healthy' : 
                  inaccessibleBuckets.length < requiredBuckets.length ? 'warning' : 'error';

    return NextResponse.json({
      status,
      totalBuckets: requiredBuckets.length,
      accessibleBuckets,
      inaccessibleBuckets,
      buckets: accessibleBuckets,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Storage health check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check storage buckets',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        totalBuckets: 0,
        accessibleBuckets: [],
        inaccessibleBuckets: [],
        buckets: []
      },
      { status: 500 }
    );
  }
}
