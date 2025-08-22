import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { Client, Databases, Storage, Account } from 'node-appwrite';

export async function GET() {
  try {
    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId)
      .setKey(process.env.APPWRITE_API_KEY || '');

    const databases = new Databases(client);
    const storage = new Storage(client);
    const account = new Account(client);

    // Test basic connectivity by listing databases
    const databaseList = await databases.list();
    
    // Test storage access by listing buckets
    const bucketList = await storage.listBuckets();
    
    // Test account service (this will fail without proper auth, but we can catch the error)
    let accountStatus = 'unknown';
    try {
      await account.get();
      accountStatus = 'authenticated';
    } catch (error) {
      // This is expected without proper authentication
      accountStatus = 'unauthenticated';
    }

    return NextResponse.json({
      status: 'connected',
      projectId: config.appwrite.projectId,
      endpoint: config.appwrite.endpoint,
      databases: databaseList.databases.length,
      buckets: bucketList.buckets.length,
      accountStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Appwrite health check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect to Appwrite',
        details: error instanceof Error ? error.message : 'Unknown error',
        projectId: config.appwrite.projectId,
        endpoint: config.appwrite.endpoint
      },
      { status: 500 }
    );
  }
}
