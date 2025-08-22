import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { Client, Databases } from 'node-appwrite';

export async function GET() {
  try {
    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId)
      .setKey(process.env.APPWRITE_API_KEY || '');

    const databases = new Databases(client);
    const requiredCollections = [
      config.appwrite.database.collections.users,
      config.appwrite.database.collections.documents,
      config.appwrite.database.collections.verifications,
      config.appwrite.database.collections.apiKeys,
      config.appwrite.database.collections.webhookConfigs,
      config.appwrite.database.collections.verificationSessions
    ];

    const accessibleCollections: string[] = [];
    const inaccessibleCollections: string[] = [];

    // Test each required collection
    for (const collectionId of requiredCollections) {
      try {
        await databases.getCollection(config.appwrite.database.id, collectionId);
        accessibleCollections.push(collectionId);
      } catch (error) {
        inaccessibleCollections.push(collectionId);
        console.warn(`Collection ${collectionId} not accessible:`, error);
      }
    }

    const status = inaccessibleCollections.length === 0 ? 'healthy' : 
                  inaccessibleCollections.length < requiredCollections.length ? 'warning' : 'error';

    return NextResponse.json({
      status,
      totalCollections: requiredCollections.length,
      accessibleCollections,
      inaccessibleCollections,
      collections: accessibleCollections,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check database collections',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        totalCollections: 0,
        accessibleCollections: [],
        inaccessibleCollections: [],
        collections: []
      },
      { status: 500 }
    );
  }
}
