import Link from 'next/link'
import { Shield, Upload, Users, Zap, AlertTriangle, ArrowRight, CheckCircle, Globe, Code, Database, Smartphone, BarChart3, Clock, Star, ChevronRight, Play, Terminal, Layers, Settings, Camera, FileText, Fingerprint, Lock, CheckSquare, Globe2, ShieldCheck, UserCheck } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">KYCPlayground</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="#api" className="text-gray-600 hover:text-gray-900 transition-colors">
              API
            </Link>
            <Link href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">
              Demo
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
              Docs
            </Link>
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto text-center">
          {/* Disclaimer Banner */}
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Demo Environment: This is a working KYC verification system for testing purposes</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Complete KYC Verification in Minutes
          </h1>
          
          <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6">
            Document verification, face recognition, and fraud detection powered by AI
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            KYCPlayground provides enterprise-grade identity verification with AI-powered document analysis, liveness detection, and comprehensive fraud screening. Integrate in minutes with our simple API.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="/demo" 
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>Try Demo</span>
            </Link>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">&lt; 500ms</div>
              <div className="text-gray-600">API Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core KYC Features */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Complete KYC Verification Suite
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
            Everything you need for compliant customer onboarding, from document verification to fraud detection
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Document Verification */}
            <div className="text-left p-8 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Document Verification</h3>
              <p className="text-gray-600 mb-6">
                AI-powered analysis of government IDs, passports, and driver's licenses with fraud detection
              </p>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>200+ document types supported</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>AI-powered authenticity checks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>OCR text extraction</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Tampering detection</span>
                </li>
              </ul>
            </div>

            {/* Face Recognition */}
            <div className="text-left p-8 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Camera className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Face Recognition</h3>
              <p className="text-gray-600 mb-6">
                Advanced biometric verification with liveness detection and spoofing prevention
              </p>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Liveness detection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Face matching with ID photos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Anti-spoofing technology</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Mobile-optimized capture</span>
                </li>
              </ul>
            </div>

            {/* Fraud Detection */}
            <div className="text-left p-8 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Fraud Detection</h3>
              <p className="text-gray-600 mb-6">
                Comprehensive risk assessment and fraud prevention using machine learning
              </p>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Risk scoring algorithms</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Document forgery detection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Identity theft prevention</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Real-time threat analysis</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            How KYC Verification Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
            Simple 3-step process that takes less than 2 minutes to complete
          </p>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Documents</h3>
              <p className="text-gray-600">
                User uploads government-issued ID (passport, driver's license, national ID)
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Face Verification</h3>
              <p className="text-gray-600">
                User takes a selfie for liveness detection and face matching
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                AI processes documents and face images for instant verification results
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">&lt; 2 min</div>
              <div className="text-gray-600">Average completion time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">99.2%</div>
              <div className="text-gray-600">Verification success rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-gray-600">Countries supported</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Global availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* API & Integration */}
      <section id="api" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Developer-First API
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                RESTful API with comprehensive SDKs, webhooks, and detailed documentation. Integrate KYC verification into your application in under 30 minutes.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckSquare className="h-5 w-5 text-green-500" />
                  <span>RESTful API with JSON responses</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckSquare className="h-5 w-5 text-green-500" />
                  <span>SDKs for Node.js, Python, PHP, Java</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckSquare className="h-5 w-5 text-green-500" />
                  <span>Webhook support for real-time updates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckSquare className="h-5 w-5 text-green-500" />
                  <span>Comprehensive API documentation</span>
                </div>
              </div>
              <Link href="/docs" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center space-x-2">
                <span>View API Documentation</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="text-green-400 font-mono text-sm">
                <div className="mb-2">// Create verification session</div>
                <div className="mb-1">POST /api/verifications/create</div>
                <div className="mb-1">{'{'}</div>
                <div className="ml-4 mb-1">"verificationType": "standard",</div>
                <div className="ml-4 mb-1">"redirectUrl": "https://yourapp.com/callback",</div>
                <div className="ml-4 mb-1">"webhookUrl": "https://yourapp.com/webhooks"</div>
                <div className="mb-1">{'}'}</div>
                <div className="mt-4 mb-2">// Response</div>
                <div className="mb-1">{'{'}</div>
                <div className="ml-4 mb-1">"sessionId": "session_123...",</div>
                <div className="ml-4 mb-1">"verificationUrl": "https://kyc.com/verify/..."</div>
                <div className="mb-1">{'}'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            KYC Verification Use Cases
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
            Trusted by companies across industries for customer verification and compliance
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 border border-gray-200 rounded-xl bg-white">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Globe2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Financial Services</h3>
              <p className="text-gray-600">
                Banking, lending, and fintech companies use KYCPlayground for customer onboarding, loan applications, and regulatory compliance
              </p>
            </div>

            <div className="p-8 border border-gray-200 rounded-xl bg-white">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Marketplaces</h3>
              <p className="text-gray-600">
                E-commerce platforms, rental services, and gig economy apps verify user identities for trust and safety
              </p>
            </div>

            <div className="p-8 border border-gray-200 rounded-xl bg-white">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Lock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Healthcare</h3>
              <p className="text-gray-600">
                Telemedicine platforms, pharmacies, and health services verify patient identities for secure access
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Security */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Enterprise-Grade Security & Compliance
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
            Built with security-first architecture and compliance with global regulations
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Security</h3>
              <ul className="text-gray-600 space-y-2 text-left">
                <li>• SOC 2 Type II certified</li>
                <li>• End-to-end encryption</li>
                <li>• GDPR compliant data handling</li>
                <li>• Regular security audits</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Compliance</h3>
              <ul className="text-gray-600 space-y-2 text-left">
                <li>• AML/KYC regulations</li>
                <li>• Local identity laws</li>
                <li>• Industry-specific requirements</li>
                <li>• Audit trail & reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to implement KYC verification?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start with our free trial and see how easy it is to add enterprise-grade identity verification to your application.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="/demo" 
              className="border border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Try Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold">KYCPlayground</span>
              </div>
              <p className="text-gray-400 mb-4">
                Enterprise-grade KYC verification with AI-powered document analysis and fraud detection
              </p>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white transition-colors">API Documentation</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Live Demo</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Developers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="/sdks" className="hover:text-white transition-colors">SDKs & Libraries</Link></li>
                <li><Link href="/webhooks" className="hover:text-white transition-colors">Webhooks</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Developer Support</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="/compliance" className="hover:text-white transition-colors">Compliance</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 KYCPlayground. All rights reserved. Enterprise-grade KYC verification platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 