# 🚀 KYCPlayground Setup Guide

## Prerequisites
- Node.js installed
- Appwrite account and project created
- npm or yarn package manager

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Create Environment File
Create a `.env.local` file in your project root with the following content:

```bash
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=YOUR_ACTUAL_PROJECT_ID_HERE
NEXT_PUBLIC_APPWRITE_DATABASE_ID=kycplayground
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_DOCUMENTS_COLLECTION_ID=documents
NEXT_PUBLIC_APPWRITE_VERIFICATIONS_COLLECTION_ID=verifications
NEXT_PUBLIC_APPWRITE_BUCKET_ID=documents
NEXT_PUBLIC_APPWRITE_VERIFY_FUNCTION_ID=verify_document

# Appwrite API Key (for server-side operations like database setup)
APPWRITE_API_KEY=YOUR_ACTUAL_API_KEY_HERE

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=KYCPlayground
NEXT_PUBLIC_APP_VERSION=1.0.0

# Security
NEXT_PUBLIC_ENABLE_REGISTRATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_PAYMENTS=false

# Mock Settings (Development Only)
NEXT_PUBLIC_MOCK_ENABLE_RANDOM_DELAYS=true
NEXT_PUBLIC_MOCK_PROCESSING_TIME=2000
NEXT_PUBLIC_MOCK_SUCCESS_RATE=0.85
```

## Step 3: Get Your Appwrite Credentials

### Project ID
1. Go to your [Appwrite Console](https://cloud.appwrite.io/)
2. Select your project
3. Go to Project Settings > General
4. Copy the Project ID

### API Key
1. In your project, go to Project Settings > API Keys
2. Click "Create API Key"
3. Give it a name (e.g., "KYCPlayground Setup")
4. Select these scopes:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `attributes.read`
   - `attributes.write`
   - `indexes.read`
   - `indexes.write`
5. Copy the generated API key

## Step 4: Create Database in Appwrite
1. In your Appwrite project, go to Databases
2. Click "Create Database"
3. Set Database ID: `kycplayground`
4. Set Name: `KYCPlayground Database`

## Step 5: Run Database Setup
```bash
node scripts/setup-webhook-database.js
```

This will:
- Connect to your Appwrite project
- Create/update the verifications collection
- Create verification_sessions collection
- Create webhook_logs collection
- Create webhook_configs collection
- Set up all required attributes and indexes

## Step 6: Start Development Server
```bash
npm run dev
```

## Troubleshooting

### "Database not found" Error
- Make sure you created the database in Appwrite console
- Check that `NEXT_PUBLIC_APPWRITE_DATABASE_ID` matches your database ID
- Verify your project ID and API key are correct

### "Missing required environment variables" Error
- Make sure `.env.local` file exists in project root
- Check that all required variables are filled in
- Restart your development server after creating `.env.local`

### "Connection failed" Error
- Verify your Appwrite endpoint URL
- Check your internet connection
- Ensure your API key has the correct permissions

### Authentication Loop
- Clear your browser's local storage and cookies
- Restart the development server
- Check that your Appwrite project is accessible

## Next Steps
After successful setup:
1. Test the authentication flow
2. Try creating a verification session
3. Test the webhook integration
4. Explore the demo page

## Support
If you encounter issues:
1. Check the browser console for error messages
2. Verify your Appwrite project settings
3. Ensure all environment variables are set correctly
4. Check that the database setup script ran successfully 