# Appwrite Setup Guide for KYCPlayground

This guide will walk you through setting up all the necessary Appwrite resources for the KYCPlayground project.

## Prerequisites

- Appwrite project created with ID: `68974869002cb3545836`
- Project endpoint: `https://fra.cloud.appwrite.io/v1`

## Step 1: Database Setup

### Create Database
1. Go to your Appwrite Console
2. Navigate to **Databases**
3. Click **Create Database**
4. Set the following:
   - **Name**: `KYCPlayground`
   - **Database ID**: `kycplayground`
   - **Permissions**: Read/Write for authenticated users

## Step 2: Create Collections

### 1. Users Collection
- **Collection ID**: `users`
- **Permissions**: Read/Write for authenticated users

**Attributes:**
```
userId (string, required)
email (string, required)
name (string, required)
role (string, required, enum: user, admin, developer)
status (string, required, enum: active, inactive, suspended)
company (string, optional)
phone (string, optional)
country (string, optional)
plan (string, required, enum: free, starter, pro, enterprise)
apiUsage (string, optional, JSON)
createdAt (datetime, required)
updatedAt (datetime, required)
```

### 2. Documents Collection
- **Collection ID**: `documents`
- **Permissions**: Read/Write for authenticated users

**Attributes:**
```
userId (string, required)
type (string, required, enum: passport, drivers_license, national_id, utility_bill, bank_statement)
fileName (string, required)
fileUrl (string, required)
fileSize (integer, required)
mimeType (string, required)
status (string, required, enum: pending, processed, failed)
metadata (string, optional, JSON)
uploadedAt (datetime, required)
processedAt (datetime, optional)
```

### 3. Verifications Collection
- **Collection ID**: `verifications`
- **Permissions**: Read/Write for authenticated users

**Attributes:**
```
userId (string, required)
documentId (string, required)
status (string, required, enum: pending, processing, verified, failed, rejected)
confidence (number, required)
processingTime (integer, required)
mockData (string, required, JSON)
webhookUrl (string, optional)
webhookSent (boolean, optional)
createdAt (datetime, required)
completedAt (datetime, optional)
```

### 4. API Keys Collection
- **Collection ID**: `api_keys`
- **Permissions**: Read/Write for authenticated users

**Attributes:**
```
userId (string, required)
name (string, required)
key (string, required)
permissions (string, required, array)
isActive (boolean, required)
lastUsedAt (datetime, optional)
createdAt (datetime, required)
expiresAt (datetime, optional)
```

### 5. Webhooks Collection
- **Collection ID**: `webhooks`
- **Permissions**: Read/Write for authenticated users

**Attributes:**
```
userId (string, required)
url (string, required)
events (string, required, array)
isActive (boolean, required)
secret (string, required)
lastTriggeredAt (datetime, optional)
createdAt (datetime, required)
```

## Step 3: Storage Setup

### Create Documents Bucket
1. Go to **Storage**
2. Click **Create Bucket**
3. Set the following:
   - **Name**: `Documents`
   - **Bucket ID**: `documents`
   - **Permissions**: Read/Write for authenticated users
   - **File size limit**: 10MB
   - **Allowed file extensions**: `jpg`, `jpeg`, `png`, `webp`, `pdf`

## Step 4: Authentication Setup

### Enable Authentication Methods
1. Go to **Auth** → **Settings**
2. Enable the following methods:
   - **Email/Password** (required)
   - **Google OAuth** (optional)
   - **GitHub OAuth** (optional)

### Configure Email Templates
1. Go to **Auth** → **Templates**
2. Customize the following templates:
   - **Welcome Email**
   - **Password Reset**
   - **Email Verification**

## Step 5: Functions Setup (Optional)

### Create Verification Function
1. Go to **Functions**
2. Click **Create Function**
3. Set the following:
   - **Name**: `verify_document`
   - **Runtime**: Node.js 18
   - **Entrypoint**: `index.js`

**Function Code Example:**
```javascript
const sdk = require('node-appwrite');

module.exports = async function (req, res) {
  const client = new sdk.Client();
  const databases = new sdk.Databases(client);

  client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68974869002cb3545836')
    .setKey(process.env.APPWRITE_API_KEY);

  try {
    const { documentId, userId } = JSON.parse(req.payload);
    
    // Mock verification logic
    const mockData = {
      faceMatch: Math.random() * 100,
      documentValid: Math.random() > 0.1,
      ocrText: "MOCK DOCUMENT DATA",
      confidence: Math.random() * 100,
      processingTime: Math.floor(Math.random() * 2000) + 500
    };

    const status = mockData.documentValid ? 'verified' : 'failed';

    // Update verification record
    await databases.updateDocument(
      'kycplayground',
      'verifications',
      documentId,
      {
        status,
        confidence: mockData.confidence,
        processingTime: mockData.processingTime,
        mockData: JSON.stringify(mockData),
        completedAt: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      verificationId: documentId,
      status,
      confidence: mockData.confidence
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
};
```

## Step 6: Environment Variables

Make sure your `.env.local` file contains:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68974869002cb3545836
NEXT_PUBLIC_APPWRITE_PROJECT_NAME=KYCPlayground

# Database and Collection IDs
NEXT_PUBLIC_APPWRITE_DATABASE_ID=kycplayground
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_DOCUMENTS_COLLECTION_ID=documents
NEXT_PUBLIC_APPWRITE_VERIFICATIONS_COLLECTION_ID=verifications
NEXT_PUBLIC_APPWRITE_API_KEYS_COLLECTION_ID=api_keys
NEXT_PUBLIC_APPWRITE_WEBHOOKS_COLLECTION_ID=webhooks

# Storage Bucket IDs
NEXT_PUBLIC_APPWRITE_BUCKET_ID=documents

# Function IDs
NEXT_PUBLIC_APPWRITE_VERIFY_FUNCTION_ID=verify_document

# Appwrite API Keys (Server-side only)
APPWRITE_API_KEY=your_api_key_here
```

## Step 7: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit the test page: `http://localhost:3000/test`

3. Click "Test Appwrite Connection" to verify the setup

4. Try registering a new user at: `http://localhost:3000/register`

## Step 8: API Key Setup

### Create API Key for Server-side Operations
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Set the following:
   - **Name**: `KYCPlayground Server Key`
   - **Permissions**:
     - `databases.read`
     - `databases.write`
     - `storage.read`
     - `storage.write`
     - `functions.read`
     - `functions.write`
4. Copy the generated API key and add it to your `.env.local` file

## Troubleshooting

### Common Issues

1. **Collection not found**
   - Verify collection IDs match exactly
   - Check permissions are set correctly

2. **Authentication errors**
   - Ensure authentication methods are enabled
   - Check email templates are configured

3. **File upload errors**
   - Verify bucket permissions
   - Check file size limits
   - Ensure allowed file extensions

4. **API key errors**
   - Verify API key has correct permissions
   - Check API key is not expired

### Getting Help

- Check the [Appwrite Documentation](https://appwrite.io/docs)
- Review the [Appwrite Console](https://console.appwrite.io)
- Check the project's test page for connection status

## Next Steps

After completing this setup:

1. **Test user registration and login**
2. **Test document upload functionality**
3. **Test verification workflow**
4. **Set up webhook endpoints**
5. **Configure API rate limiting**

---

**Remember: This is a mock service for testing purposes only!** 