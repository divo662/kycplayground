# KYCPlayground 🚀

A **fully functional KYC verification platform** with AI-powered document analysis, face recognition, and fraud detection. Built for developers to integrate enterprise-grade identity verification into their applications.

## ⚠️ Important Disclaimer

> **KYCPlayground is a working KYC verification system for testing and development purposes. While it performs real document analysis and face verification, it uses simulated AI responses and should not be used for production identity verification.**

## 🎯 Project Overview

KYCPlayground provides developers with a complete KYC verification solution that includes:

- **Document Verification**: AI-powered analysis of government IDs, passports, and driver's licenses
- **Face Recognition**: Liveness detection and biometric verification with anti-spoofing
- **Fraud Detection**: Risk assessment and document authenticity validation
- **Developer API**: RESTful API with webhooks for seamless integration
- **Demo Environment**: Fully functional verification flow for testing

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for responsive design
- **Shadcn/ui** for consistent UI components
- **React Hook Form** + **Zod** for form validation
- **Zustand** for state management
- **Lucide React** for icons

### Backend & AI
- **Appwrite** for authentication, database, and file storage
- **Groq AI** for vision analysis and document quality assessment
- **Mock AI Processor** for development and testing
- **Next.js API Routes** for backend logic
- **Rate limiting** and security middleware

### Infrastructure
- **Appwrite Cloud** for backend services
- **Vercel** for frontend deployment
- **TypeScript** for type safety
- **ESLint** + **Prettier** for code quality

## 📁 Project Structure

```
KYCPlayground/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/               # User login
│   │   └── register/            # User registration
│   ├── dashboard/                # Main dashboard
│   │   ├── verifications/        # Verification management
│   │   ├── documents/           # Document management
│   │   ├── api-keys/            # API key management
│   │   └── analytics/           # Verification analytics
│   ├── demo/                    # Integration demo
│   ├── verify/[sessionId]/      # Verification flow
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── documents/           # Document handling
│   │   ├── verifications/       # Verification endpoints
│   │   ├── webhooks/            # Webhook management
│   │   └── analytics/           # Analytics endpoints
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/                   # Reusable components
│   ├── ui/                      # UI components
│   │   ├── camera-capture.tsx   # Camera/photo capture
│   │   ├── file-upload.tsx      # File upload component
│   │   └── ...                  # Other UI components
│   ├── forms/                   # Form components
│   ├── dashboard/               # Dashboard components
│   └── layout/                  # Layout components
├── lib/                         # Core libraries
│   ├── appwrite-service.ts      # Appwrite client & services
│   ├── security.ts              # Security middleware
│   ├── vision-groq.ts          # Groq AI integration
│   ├── mock-ai-processor.ts     # Mock AI for development
│   ├── mrz-parser.ts           # MRZ text parsing
│   ├── image-quality.ts        # Image quality analysis
│   ├── video-liveness.ts       # Video liveness detection
│   ├── country-rules.ts        # Country-specific rules
│   └── config.ts               # Configuration
├── types/                       # TypeScript definitions
├── hooks/                       # Custom React hooks
├── public/                      # Static assets
└── docs/                        # Documentation
    ├── integration-guide.md     # Developer integration guide
    ├── api-reference.md         # API documentation
    └── ngrok-webhook-guide.md   # Webhook testing guide
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** 
- **npm** or **yarn**
- **Appwrite account** (free tier available)
- **Groq AI API key** (optional, for enhanced features)

### 1. Clone and Install
```bash
git clone <your-repo>
cd KYCPlayground
npm install
```

### 2. Environment Setup
Create `.env.local`:
```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-project.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=kycplayground
NEXT_PUBLIC_APPWRITE_COLLECTION_ID=your_collection_id
NEXT_PUBLIC_APPWRITE_BUCKET_ID=documents

# Appwrite API Keys (for server-side)
APPWRITE_API_KEY=your_api_key

# Groq AI (Optional - for enhanced document analysis)
GROQ_API_KEY=your_groq_api_key
GROQ_VISION_MODEL=meta-llama/llama-4-maverick-17b-128e-instruct
GROQ_API_BASE=https://api.groq.com/openai/v1

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Appwrite Setup
1. **Create Appwrite project** at [cloud.appwrite.io](https://cloud.appwrite.io)
2. **Set up collections**:
   - `users` - User management
   - `verificationSessions` - Verification sessions
   - `documents` - Document storage
   - `webhooks` - Webhook management
3. **Create storage bucket** for document uploads
4. **Set up authentication** methods (email/password)
5. **Configure permissions** and indexes

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📋 Features

### 🔐 Core KYC Features
- ✅ **Document Verification**: 200+ document types supported
- ✅ **Face Recognition**: Liveness detection and anti-spoofing
- ✅ **Fraud Detection**: Risk scoring and authenticity checks
- ✅ **OCR Processing**: Text extraction from documents
- ✅ **MRZ Parsing**: Machine Readable Zone data extraction
- ✅ **Quality Assessment**: Blur, glare, and crop detection

### 🤖 AI & Machine Learning
- ✅ **Groq AI Integration**: Vision models for document analysis
- ✅ **Mock AI Processor**: Development and testing support
- ✅ **Image Quality Analysis**: Professional-grade assessment
- ✅ **Video Liveness**: Basic liveness detection
- ✅ **Country-Specific Rules**: Regional compliance support

### 🚀 Developer Experience
- ✅ **RESTful API**: Complete verification workflow
- ✅ **Webhook Support**: Real-time verification updates
- ✅ **SDK Examples**: Node.js, Python, PHP, Java
- ✅ **Demo Environment**: End-to-end testing
- ✅ **Rate Limiting**: Configurable API limits
- ✅ **Security Middleware**: CORS and API key validation

### 📱 User Experience
- ✅ **Mobile Responsive**: Works on all devices
- ✅ **Camera Integration**: Photo and video capture
- ✅ **Drag & Drop**: Easy file uploads
- ✅ **Progress Tracking**: Real-time verification status
- ✅ **Error Handling**: Clear feedback and retry options

## 🔧 API Integration

### Quick Start
```javascript
// 1. Create verification session
const response = await fetch('/api/verifications/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    verificationType: 'id_card',
    redirectUrl: 'https://yourapp.com/callback',
    webhookUrl: 'https://yourapp.com/webhooks/kyc',
    isDemo: true
  })
})

const { sessionId, verificationUrl } = await response.json()

// 2. Redirect user to verification
window.location.href = verificationUrl

// 3. Handle webhook results
app.post('/webhooks/kyc', (req, res) => {
  const { sessionId, status, results } = req.body
  // Update user verification status
  res.status(200).json({ received: true })
})
```

### API Endpoints
- `POST /api/verifications/create` - Create verification session
- `GET /api/verifications/[sessionId]` - Get session status
- `POST /api/verifications/[sessionId]/process` - Process verification
- `POST /api/verifications/[sessionId]/update` - Update session
- `POST /api/webhooks/test` - Test webhook delivery

## 📊 Database Schema

### Verification Sessions
```typescript
{
  $id: string,                    // Session ID (demo_xxx or session_xxx)
  sessionId: string,              // Unique session identifier
  verificationId: string,         // Verification reference
  apiKeyId: string,               // API key used
  userId: string,                 // User identifier
  verificationType: string,       // Type of verification
  redirectUrl: string,            // Return URL after completion
  webhookUrl: string,             // Webhook endpoint
  options: string,                // JSON string of options
  status: 'pending' | 'completed' | 'failed',
  webhookSent: boolean,           // Webhook delivery status
  expiresAt: string,              // ISO timestamp
  createdAt: string,              // ISO timestamp
  updatedAt: string               // ISO timestamp
}
```

### Documents
```typescript
{
  $id: string,                    // Document ID
  userId: string,                 // User identifier
  sessionId: string,              // Session reference
  documentType: 'id_document' | 'face_photo' | 'face_video',
  fileName: string,               // Original filename
  fileUrl: string,                // Storage URL
  fileSize: number,               // File size in bytes
  mimeType: string,               // MIME type
  status: 'pending' | 'processed' | 'failed',
  uploadedAt: string,             // ISO timestamp
  processedAt?: string,           // ISO timestamp
  metadata: string                // JSON string of metadata
}
```

## 🧪 Testing & Demo

### Demo Environment
1. **Visit `/demo`** to see integration examples
2. **Click "Start Demo Verification"** to test the flow
3. **Upload documents** and take selfies
4. **Complete verification** end-to-end
5. **Check webhook delivery** in real-time

### Testing Tools
- **Mock AI Processor**: Simulates AI responses
- **Fallback Analysis**: Document type detection
- **Quality Metrics**: File size and format validation
- **Error Simulation**: Test failure scenarios

## 🔒 Security & Compliance

### Security Features
- **API Key Authentication**: Secure endpoint access
- **Rate Limiting**: Configurable request limits
- **CORS Protection**: Origin validation
- **Input Validation**: Request sanitization
- **Error Handling**: Secure error messages

### Development vs Production
- **Development**: 1000 requests/minute, demo mode enabled
- **Production**: 100 requests/15 minutes, strict validation
- **Demo Sessions**: No rate limiting, full functionality

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Backend (Appwrite)
- **Cloud**: Use [cloud.appwrite.io](https://cloud.appwrite.io)
- **Self-hosted**: Follow [Appwrite docs](https://appwrite.io/docs/installation)

### Environment Variables
- Set production URLs and API keys
- Configure webhook endpoints
- Set appropriate rate limits

## 📈 Roadmap

### Phase 1 (Current) ✅
- ✅ Basic KYC verification
- ✅ Document upload and analysis
- ✅ Face recognition and liveness
- ✅ API integration
- ✅ Demo environment

### Phase 2 (Next)
- [ ] Advanced fraud detection
- [ ] Multi-language support
- [ ] Enhanced analytics
- [ ] Mobile SDKs
- [ ] Compliance reporting

### Phase 3 (Future)
- [ ] Real-time video verification
- [ ] Advanced AI models
- [ ] Global compliance rules
- [ ] Enterprise features
- [ ] White-label solutions

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** pull request

### Development Guidelines
- **TypeScript**: Strict mode enabled
- **Testing**: Add tests for new features
- **Documentation**: Update docs for API changes
- **Code Style**: Follow ESLint + Prettier rules

## 🆘 Support & Community

### Getting Help
- **Documentation**: Check `/docs` folder
- **Issues**: Create GitHub issue for bugs
- **Discussions**: Use GitHub Discussions
- **Examples**: Check `/demo` for integration examples

### Resources
- **API Reference**: `/docs/api-reference.md`
- **Integration Guide**: `/docs/integration-guide.md`
- **Webhook Testing**: `/docs/ngrok-webhook-guide.md`
- **Appwrite Docs**: [appwrite.io/docs](https://appwrite.io/docs)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **Appwrite** for backend infrastructure
- **Groq AI** for vision analysis capabilities
- **Next.js** for the amazing React framework
- **Tailwind CSS** for utility-first styling
- **Shadcn/ui** for beautiful components

---

**KYCPlayground**: Enterprise-grade KYC verification for developers 🚀

*Built with ❤️ for the developer community* 