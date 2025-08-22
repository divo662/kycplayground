import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { Client, Databases, Storage } from 'node-appwrite';

export async function GET() {
  try {
    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId)
      .setKey(process.env.APPWRITE_API_KEY || '');

    const databases = new Databases(client);
    const storage = new Storage(client);

    const permissions = {
      database: {
        read: false,
        write: false,
        create: false,
        delete: false
      },
      storage: {
        read: false,
        write: false,
        create: false,
        delete: false
      }
    };

    // Test database permissions
    try {
      // Test read permission
      await databases.list();
      permissions.database.read = true;
    } catch (error) {
      console.warn('Database read permission test failed:', error);
    }

    try {
      // Test write permission by attempting to create a temporary document
      // We'll use a collection that should exist
      const testCollection = config.appwrite.database.collections.users;
      await databases.createDocument(
        config.appwrite.database.id,
        testCollection,
        'unique()',
        { test: true, timestamp: new Date().toISOString() }
      );
      permissions.database.write = true;
      permissions.database.create = true;
      
      // Clean up test document
      try {
        await databases.deleteDocument(
          config.appwrite.database.id,
          testCollection,
          'unique()'
        );
        permissions.database.delete = true;
      } catch (cleanupError) {
        console.warn('Database delete permission test failed:', cleanupError);
      }
    } catch (error) {
      console.warn('Database write permission test failed:', error);
    }

    // Test storage permissions
    try {
      // Test read permission
      await storage.listBuckets();
      permissions.storage.read = true;
    } catch (error) {
      console.warn('Storage read permission test failed:', error);
    }

    try {
      // Test write permission by attempting to create a temporary file
      const testBucket = config.appwrite.storage.buckets.documents;
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      await storage.createFile(
        testBucket,
        'unique()',
        testFile
      );
      permissions.storage.write = true;
      permissions.storage.create = true;
      
      // Clean up test file
      try {
        await storage.deleteFile(testBucket, 'unique()');
        permissions.storage.delete = true;
      } catch (cleanupError) {
        console.warn('Storage delete permission test failed:', cleanupError);
      }
    } catch (error) {
      console.warn('Storage write permission test failed:', error);
    }

    // Calculate overall permission status
    const dbPermissions = Object.values(permissions.database);
    const storagePermissions = Object.values(permissions.storage);
    
    const dbHealthy = dbPermissions.filter(Boolean).length >= 2; // At least read and write
    const storageHealthy = storagePermissions.filter(Boolean).length >= 2; // At least read and write
    
    const overallStatus = dbHealthy && storageHealthy ? 'healthy' : 
                         (dbHealthy || storageHealthy) ? 'warning' : 'error';

    return NextResponse.json({
      status: overallStatus,
      permissions,
      database: {
        status: dbHealthy ? 'healthy' : 'warning',
        permissions: permissions.database
      },
      storage: {
        status: storageHealthy ? 'healthy' : 'warning',
        permissions: permissions.storage
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Permissions health check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check permissions',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        permissions: {
          database: { read: false, write: false, create: false, delete: false },
          storage: { read: false, write: false, create: false, delete: false }
        }
      },
      { status: 500 }
    );
  }
}
