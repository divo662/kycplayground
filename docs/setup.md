# KYCPlayground Setup Guide

This guide will walk you through setting up KYCPlayground on your local machine for development.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Appwrite account** (free tier available)

## Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd KYCPlayground
```

## Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

## Step 3: Set Up Appwrite

### 3.1 Create Appwrite Project

1. Go to [Appwrite Console](https://console.appwrite.io/)
2. Create a new project called "KYCPlayground"
3. Note down your **Project ID**

### 3.2 Set Up Authentication

1. In your Appwrite project, go to **Auth** → **Settings**
2. Enable the authentication methods you want to use:
   - Email/Password (recommended for development)
   - Google OAuth (optional)
   - GitHub OAuth (optional)

### 3.3 Create Database

1. Go to **Databases** → **Create Database**
2. Name: `kycplayground`
3. Database ID: `kycplayground`

### 3.4 Create Collections

#### Users Collection
- Collection ID: `users`
- Permissions: Read/Write for authenticated users

**Attributes:**
```
email (string, required, unique)
name (string, required)
role (string, required, enum: user, admin, developer)
status (string, required, enum: active, inactive, suspended, pending)
avatar (string, optional)
company (string, optional)
phone (string, optional)
country (string, optional)
timezone (string, optional)
preferences (string, optional, JSON)
apiKey (string, optional)
apiUsage (string, optional, JSON)
createdAt (datetime, required)
updatedAt (datetime, required)
lastLoginAt (datetime, optional)
```

#### Documents Collection
- Collection ID: `documents`
- Permissions: Read/Write for authenticated users

**Attributes:**
```
userId (string, required)
type (string, required, enum: passport, drivers_license, national_id, utility_bill, bank_statement)
fileName (string, required)
fileUrl (string, required)
fileSize (integer, required)
mimeType (string, required)
status (string, required, enum: pending, processed, failed)
uploadedAt (datetime, required)
processedAt (datetime, optional)
metadata (string, optional, JSON)
```

#### Verifications Collection
- Collection ID: `verifications`
- Permissions: Read/Write for authenticated users

**Attributes:**
```
userId (string, required)
documentId (string, required)
status (string, required, enum: pending, processing, verified, failed, rejected)
confidence (number, required)
processingTime (integer, required)
mockData (string, required, JSON)
createdAt (datetime, required)
completedAt (datetime, optional)
notes (string, optional)
```

### 3.5 Create Storage Bucket

1. Go to **Storage** → **Create Bucket**
2. Name: `documents`
3. Bucket ID: `documents`
4. Permissions: Read/Write for authenticated users
5. File size limit: 10MB
6. Allowed file extensions: `jpg`, `jpeg`, `png`, `webp`, `pdf`

### 3.6 Create Cloud Function (Optional)

For advanced mock AI processing, you can create a cloud function:

1. Go to **Functions** → **Create Function**
2. Name: `verify_document`
3. Runtime: Node.js 18
4. Entrypoint: `index.js`

## Step 4: Environment Configuration

1. Copy the example environment file:
```bash
cp env.example .env.local
```

2. Update `.env.local` with your Appwrite credentials:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here

# Database and Collection IDs
NEXT_PUBLIC_APPWRITE_DATABASE_ID=kycplayground
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_DOCUMENTS_COLLECTION_ID=documents
NEXT_PUBLIC_APPWRITE_VERIFICATIONS_COLLECTION_ID=verifications

# Storage Bucket IDs
NEXT_PUBLIC_APPWRITE_BUCKET_ID=documents

# Function IDs
NEXT_PUBLIC_APPWRITE_VERIFY_FUNCTION_ID=verify_document

# Appwrite API Keys (Server-side only)
APPWRITE_API_KEY=your_api_key_here
```

## Step 5: Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Initial Setup

1. **Register a new account** on the application
2. **Verify your email** (if email verification is enabled)
3. **Log in** to access the dashboard
4. **Upload a test document** to verify everything is working

## Troubleshooting

### Common Issues

#### 1. Appwrite Connection Error
- Verify your project ID and endpoint URL
- Check if your API key has the correct permissions
- Ensure your Appwrite project is active

#### 2. File Upload Issues
- Check storage bucket permissions
- Verify file size limits
- Ensure allowed file extensions are configured

#### 3. Database Permission Errors
- Verify collection permissions are set correctly
- Check if user is authenticated
- Ensure collection IDs match your environment variables

#### 4. Build Errors
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

### Getting Help

If you encounter issues:

1. Check the [Appwrite Documentation](https://appwrite.io/docs)
2. Review the [Next.js Documentation](https://nextjs.org/docs)
3. Check the project's [GitHub Issues](https://github.com/your-repo/issues)
4. Join our [Discord Community](https://discord.gg/your-community)

## Next Steps

After successful setup:

1. **Explore the Dashboard** - Upload documents and test verifications
2. **Review the API** - Check out the API documentation
3. **Customize Mock Logic** - Modify the verification simulation
4. **Add Features** - Extend the platform with new capabilities
5. **Deploy** - Deploy to Vercel or your preferred hosting platform

## Development Workflow

### Code Structure
```
KYCPlayground/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── lib/                    # Utility functions and configurations
├── types/                  # TypeScript type definitions
├── hooks/                  # Custom React hooks
└── docs/                   # Documentation
```

### Key Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Contributing
1. Create a feature branch
2. Make your changes
3. Add tests if applicable
4. Submit a pull request

---

**Remember: This is a mock service for testing purposes only!** 