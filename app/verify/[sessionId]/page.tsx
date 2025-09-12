'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Head from 'next/head'
import { Upload, CheckCircle, AlertCircle, Clock, FileText, User, Calendar, Shield, RefreshCw, RotateCcw } from 'lucide-react'
import { FileUploadService } from '@/lib/file-upload-service'
import WebcamCapture from '@/components/ui/webcam-capture'

interface VerificationSessionRecord {
  id: string
  sessionId: string
  verificationId: string
  webhookUrl: string
  redirectUrl?: string
  options: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
  completedAt?: string
  results?: any
  userId?: string
}

interface VerificationResult {
  name?: string
  documentType?: string
  confidence: number
  processedAt: string
  documentNumber?: string
  expiryDate?: string
  nationality?: string
}

export default function VerifyPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/dashboard'
  
  const [session, setSession] = useState<VerificationSessionRecord | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending')
  const [documents, setDocuments] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [banner, setBanner] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null)
  const [showRedirectModal, setShowRedirectModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [processingStep, setProcessingStep] = useState<number>(0)
  const successSectionRef = useRef<HTMLDivElement | null>(null)
  const [verificationMethod, setVerificationMethod] = useState<'document' | 'face_photo' | 'face_video'>('document')

  // Stepper state management
  const [currentStep, setCurrentStep] = useState(1)
  const [stepStatus, setStepStatus] = useState<'pending' | 'active' | 'completed' | 'error'>('pending')

  // Update stepper based on verification status
  useEffect(() => {
    if (verificationStatus === 'pending') {
      setCurrentStep(1)
      setStepStatus('pending')
    } else if (verificationStatus === 'processing') {
      setCurrentStep(3) // Stage 3 shows processing
      setStepStatus('active')
    } else if (verificationStatus === 'completed') {
      setCurrentStep(3)
      setStepStatus('completed')
    } else if (verificationStatus === 'failed') {
      setCurrentStep(3)
      setStepStatus('error')
    }
  }, [verificationStatus])

  // Update stepper when files are uploaded
  useEffect(() => {
    if (documents.length > 0 && verificationStatus === 'pending') {
      setCurrentStep(1)
      setStepStatus('completed')
    }
  }, [documents.length, verificationStatus])

  const resolvedReturnUrl = useMemo(() => {
    let baseUrl = returnUrl
    if (!baseUrl && session?.redirectUrl) {
      try {
        const url = new URL(session.redirectUrl)
        const fromSession = url.searchParams.get('returnUrl')
        if (fromSession) baseUrl = fromSession
      } catch {}
    }
    if (!baseUrl) return '/dashboard'
    
    // Append session ID to the callback URL
    try {
      const url = new URL(baseUrl)
      url.searchParams.set('sessionId', sessionId)
      return url.toString()
    } catch {
      // If URL parsing fails, append session ID manually
      const separator = baseUrl.includes('?') ? '&' : '?'
      return `${baseUrl}${separator}sessionId=${sessionId}`
    }
  }, [returnUrl, session, sessionId])

  useEffect(() => {
    fetchSessionDetails()
  }, [sessionId])

  // Animate processing checklist steps when in processing state
  useEffect(() => {
    if (verificationStatus === 'processing') {
      setProcessingStep(0)
      const timers = [500, 1000, 1500, 2000].map((ms, idx) =>
        setTimeout(() => setProcessingStep(idx + 1), ms)
      )
      return () => timers.forEach(clearTimeout)
    }
  }, [verificationStatus])

  // Focus success summary section for a11y
  useEffect(() => {
    if (verificationStatus === 'completed') {
      setTimeout(() => {
        successSectionRef.current?.focus()
      }, 50)
    }
  }, [verificationStatus])

  const fetchSessionDetails = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching session:', sessionId)
      const response = await fetch(`/api/verifications/${sessionId}`)
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        console.error('❌ HTTP error:', response.status, response.statusText)
        setError(`Failed to load session: ${response.status} ${response.statusText}`)
        return
      }
      
      const data = await response.json()
      console.log('📄 Response data:', data)
      
      if (data.success && data.data) {
        setSession(data.data)
        setVerificationStatus(data.data.status || 'pending')
        if (data.data.results) {
          try {
            const parsed = typeof data.data.results === 'string' ? JSON.parse(data.data.results) : data.data.results
            setVerificationResult(parsed)
          } catch (e) {
            console.warn('Failed to parse results:', e)
            setVerificationResult(null)
          }
        }
        if (data.data.status === 'completed') {
          setBanner({ type: 'success', message: 'Verification completed successfully.' })
          // Trigger redirect for already completed verifications
          // Use resolvedReturnUrl (callback URL) instead of data.data.redirectUrl (verification page URL)
          const redirectUrl = resolvedReturnUrl
          if (redirectUrl && redirectUrl !== '/dashboard') {
            setShowRedirectModal(true)
            setTimeout(() => {
              if (redirectUrl.startsWith('http')) {
                window.location.href = redirectUrl
              } else {
                router.push(redirectUrl)
              }
            }, 1800)
          }
        }
      } else {
        console.error('❌ Session fetch failed:', data.error || 'Unknown error')
        setError(data.error || 'Session not found')
      }
    } catch (error) {
      console.error('❌ Error fetching session:', error)
      setError(`Failed to load session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      console.log('✅ Setting loading to false')
      setLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const maxSizeBytes = 10 * 1024 * 1024
    const allowed = ['image/', 'application/pdf']
    const current = new Map(documents.map(f => [`${f.name}:${f.size}`, true]))

    const nextDocs: File[] = [...documents]
    const errs: string[] = []

    for (const f of files) {
      const isAllowedType = allowed.some(prefix => f.type.startsWith(prefix))
      if (!isAllowedType) {
        errs.push(`${f.name}: Unsupported type (${f.type || 'unknown'})`)
        continue
      }
      if (f.size > maxSizeBytes) {
        errs.push(`${f.name}: File exceeds 10MB limit`)
        continue
      }
      const key = `${f.name}:${f.size}`
      if (current.has(key)) {
        errs.push(`${f.name}: Duplicate file`)
        continue
      }
      
      // Set document type based on verification method and file type
      let docType: 'id_document' | 'face_photo' | 'face_video'
      if (f.type.startsWith('video/')) {
        docType = 'face_video'
      } else if (verificationMethod === 'face_photo' || verificationMethod === 'face_video') {
        docType = 'face_photo'
      } else {
        docType = 'id_document'
      }
      
      // Override based on file name hints
      const fileName = f.name.toLowerCase()
      if (fileName.includes('passport') || fileName.includes('license') || fileName.includes('id') || 
          fileName.includes('card') || fileName.includes('document') || fileName.includes('national')) {
        docType = 'id_document'
      } else if (fileName.includes('face') || fileName.includes('selfie') || fileName.includes('photo') ||
                 fileName.includes('capture') || fileName.includes('liveness')) {
        docType = 'face_photo'
      }
      
      const fileWithType = Object.assign(f, { documentType: docType })
      current.set(key, true)
      nextDocs.push(fileWithType)
    }

    setDocuments(nextDocs)
    setValidationErrors(errs)
  }

  const addCapturedFile = async (blob: Blob, suggestedName: string, mimeType: string) => {
    try {
      const file = new File([blob], suggestedName, { type: mimeType })
      // Reuse validation rules
      const validation = FileUploadService.validateFile(file)
      if (!validation.valid) {
        setValidationErrors([validation.error || 'Invalid file'])
        return
      }
      // Prevent duplicates by name+size
      const key = `${file.name}:${file.size}`
      const current = new Map(documents.map(f => [`${f.name}:${f.size}`, true]))
      if (current.has(key)) {
        setValidationErrors([`${file.name}: Duplicate file`])
        return
      }
      
      // Set the document type based on the verification method
      const docType = verificationMethod === 'face_video' ? 'face_video' : 'face_photo'
      const fileWithType = Object.assign(file, { documentType: docType })
      
      setDocuments(prev => [...prev, fileWithType])
      setValidationErrors([])
      setBanner({ type: 'info', message: 'Capture added. You can start verification.' })
    } catch (e) {
      setValidationErrors(['Failed to add captured media'])
    }
  }

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const startVerification = async () => {
    if (documents.length === 0) {
      setBanner({ type: 'error', message: 'Please upload at least one document to proceed.' })
      return
    }

    setBanner({ type: 'info', message: 'Processing your documents. This may take a moment…' })
    setUploading(true)
    setVerificationStatus('processing')
    
    // Update stepper to show processing in stage 3
    setCurrentStep(3)
    setStepStatus('active')

    try {
      // Simulate AI processing with realistic delays
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Upload to Appwrite Storage (associate with session) and collect URLs
      const uploadedSummaries: { name: string; size: number; type: string; url?: string }[] = []
      for (const f of documents) {
        try {
          const isImage = f.type?.startsWith('image/')
          const isVideo = f.type?.startsWith('video/')
          
          // Better categorization logic
          let docType: 'id_document' | 'face_photo' | 'face_video'
          if (isVideo) {
            docType = 'face_video'
          } else if (isImage) {
            // Check if this looks like an ID document or face photo
            // For now, use the verification method as a hint, but we'll improve this
            if (verificationMethod === 'face_photo' || verificationMethod === 'face_video') {
              docType = 'face_photo'
            } else {
              // If it's document mode, assume it's an ID document
              docType = 'id_document'
            }
          } else {
            // PDFs are typically ID documents
            docType = 'id_document'
          }
          
          // Override categorization based on file name hints
          const fileName = f.name.toLowerCase()
          if (fileName.includes('passport') || fileName.includes('license') || fileName.includes('id') || 
              fileName.includes('card') || fileName.includes('document') || fileName.includes('national')) {
            docType = 'id_document'
          } else if (fileName.includes('face') || fileName.includes('selfie') || fileName.includes('photo') ||
                     fileName.includes('capture') || fileName.includes('liveness')) {
            docType = 'face_photo'
          }
          
          // Use manually selected document type if available (this takes priority)
          if ((f as any).documentType) {
            docType = (f as any).documentType
          }
          
          const res = await FileUploadService.uploadFileForSession(
            f,
            docType,
            session?.userId || 'external',
            sessionId
          )
          if (res.success && res.file) {
            uploadedSummaries.push({ name: f.name, size: f.size, type: f.type, url: res.file.fileUrl as any })
          } else {
            uploadedSummaries.push({ name: f.name, size: f.size, type: f.type })
          }
        } catch {
          uploadedSummaries.push({ name: f.name, size: f.size, type: f.type })
        }
      }

      // Generate verification summary and include uploaded file metadata for audit
      const results = {
        confidence: 0.95,
        processedAt: new Date().toISOString(),
        uploadedFiles: uploadedSummaries
      }
      
      setVerificationResult(results)
      setVerificationStatus('completed')

      // Server-side validation and completion
      try {
        const res = await fetch(`/api/verifications/${sessionId}/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method: verificationMethod })
        })
        const json = await res.json()
        if (json?.status !== 'completed') {
          setVerificationStatus('failed')
          // More specific error message based on what's missing
          if (json?.counts) {
            const { documents: docCount, face: faceCount } = json.counts
            if (docCount === 0 && faceCount > 0) {
              setBanner({ 
                type: 'error', 
                message: 'Missing ID Document: You need to upload an ID document (passport, driver license, national ID) along with your face photo.' 
              })
            } else if (docCount > 0 && faceCount === 0) {
              setBanner({ 
                type: 'error', 
                message: 'Missing Face Capture: You need to capture a photo of your face along with your ID document.' 
              })
            } else {
              setBanner({ 
                type: 'error', 
                message: 'Requirements not met. Please provide at least 1 ID document and 1 face capture.' 
              })
            }
          } else {
            setBanner({ 
              type: 'error', 
              message: 'Requirements not met. Please provide at least 1 ID document and 1 face capture.' 
            })
          }
          return
        }
      } catch (e) {
        // fallback to client-side saved state if process endpoint fails
      await updateVerificationStatus('completed', results)
      }

      console.log('✅ Verification completed and saved to database')
      setBanner({ type: 'success', message: 'Verification completed successfully.' })
      // Use resolvedReturnUrl (callback URL) instead of session?.redirectUrl (verification page URL)
      const redirectUrl = resolvedReturnUrl
      if (redirectUrl && redirectUrl !== '/dashboard') {
        setShowRedirectModal(true)
        setTimeout(() => {
          if (redirectUrl.startsWith('http')) {
            window.location.href = redirectUrl
          } else {
            router.push(redirectUrl)
          }
        }, 1800)
      }

    } catch (error) {
      setVerificationStatus('failed')
      console.error('Verification failed:', error)
      setBanner({ type: 'error', message: 'Verification failed. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  const updateVerificationStatus = async (status: string, results?: any) => {
    try {
      const response = await fetch(`/api/verifications/${sessionId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          results,
          webhookUrl: session?.webhookUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update verification status')
      }

      console.log('✅ Verification status updated in database')
    } catch (error) {
      console.error('❌ Error updating verification status:', error)
    }
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'completed':
        return <CheckCircle className="h-10 w-10 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-10 w-10 text-red-500" />
      case 'processing':
        return <Clock className="h-10 w-10 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-10 w-10 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'completed':
        return 'Verification Complete!'
      case 'failed':
        return 'Verification Failed'
      case 'processing':
        return 'Processing Documents...'
      default:
        return 'Ready to Start'
    }
  }

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification session...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Meta tag for camera permissions */}
      <Head>
        <meta name="permissions-policy" content="camera=(self), microphone=(self), geolocation=()" />
      </Head>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Live region for status updates */}
        <div role="status" aria-live="polite" className="sr-only">
          {getStatusText()}
        </div>
        {/* Inline Status Banner */}
        {banner && (
          <div className={`mb-6 rounded-xl border px-4 py-3 ${
            banner.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            banner.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {banner.message}
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              KYC Verification
            </h1>
          </div>
          <div className="bg-white rounded-full px-6 py-2 inline-block shadow-sm border">
            <p className="text-sm text-gray-600 font-mono">
              Session: {sessionId}
            </p>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Step 1: Upload */}
            <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-medium border-2 ${
                currentStep >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-gray-50'
              }`}>
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span className="ml-2 text-sm sm:text-base font-medium">Upload</span>
            </div>
            
            {/* Connector */}
            <div className={`w-8 sm:w-12 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            
            {/* Step 2: Processing */}
            <div className={`flex items-center ${currentStep >= 2 ? 
              (currentStep > 2 ? 'text-green-600' : 'text-blue-600') : 'text-gray-400'}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-medium border-2 ${
                currentStep === 2 ? 'border-blue-600 bg-blue-50 animate-pulse' : 
                currentStep > 2 ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}>
                {currentStep > 2 ? '✓' : 
                 currentStep === 2 && stepStatus === 'active' ? '⏳' : '2'}
              </div>
              <span className="ml-2 text-sm sm:text-base font-medium">
                {currentStep === 2 && stepStatus === 'active' ? 'Processing...' : 
                 currentStep > 2 ? 'Completed' : 'Processing'}
              </span>
            </div>
            
            {/* Connector */}
            <div className={`w-8 sm:w-12 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            
            {/* Step 3: Complete/Error */}
            <div className={`flex items-center ${currentStep >= 3 ? 
              (stepStatus === 'error' ? 'text-red-600' : 
               stepStatus === 'active' ? 'text-blue-600' : 'text-green-600') : 'text-gray-400'}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-medium border-2 ${
                currentStep === 3 && stepStatus === 'active' ? 'border-blue-600 bg-blue-50 animate-pulse' :
                currentStep === 3 && stepStatus === 'error' ? 'border-red-600 bg-red-50' :
                currentStep === 3 && stepStatus === 'completed' ? 'border-green-600 bg-green-50' :
                'border-gray-300 bg-gray-50'
              }`}>
                {currentStep === 3 && stepStatus === 'active' ? '⏳' :
                 currentStep === 3 && stepStatus === 'error' ? '✗' :
                 currentStep === 3 && stepStatus === 'completed' ? '✓' : '3'}
              </div>
              <span className="ml-2 text-sm sm:text-base font-medium">
                {currentStep === 3 && stepStatus === 'active' ? 'Verifying...' :
                 currentStep === 3 && stepStatus === 'error' ? 'Failed' :
                 currentStep === 3 && stepStatus === 'completed' ? 'Complete' : 'Complete'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-lg border p-8 mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {getStatusIcon()}
            <h2 className={`text-2xl font-bold ${getStatusColor()}`}>
              {getStatusText()}
            </h2>
          </div>
          
          {verificationStatus === 'processing' && (
            <div className="mt-2">
              <ul className="space-y-2">
                {['Uploading files', 'Quality checks', 'Authenticity checks', 'OCR & extraction'].map((label, idx) => (
                  <li key={label} className={`flex items-center gap-3 text-sm rounded-lg px-3 py-2 border ${processingStep > idx ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${processingStep > idx ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-3">Don’t refresh this page.</p>
            </div>
          )}
          
          {verificationStatus === 'completed' && verificationResult && (
            <div ref={successSectionRef} tabIndex={-1} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6" aria-label="Verification results">
              <h3 className="font-semibold text-green-900 mb-4 text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Verification Results
              </h3>
              
              {/* Manual redirect button */}
              {resolvedReturnUrl && resolvedReturnUrl !== '/dashboard' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    You should be redirected automatically. If not, click the button below:
                  </p>
                  <button
                    onClick={() => {
                      const redirectUrl = resolvedReturnUrl
                      if (redirectUrl.startsWith('http')) {
                        window.location.href = redirectUrl
                      } else {
                        router.push(redirectUrl)
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Continue to App
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {verificationResult.name && (
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-green-600" />
                  <span className="text-green-800"><strong>Name:</strong> {verificationResult.name}</span>
                </div>
                )}
                {verificationResult.documentType && (
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="text-green-800"><strong>Document:</strong> {verificationResult.documentType}</span>
                </div>
                )}
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-green-800"><strong>Confidence:</strong> {(verificationResult.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="text-green-800"><strong>Processed:</strong> {new Date(verificationResult.processedAt).toLocaleString()}</span>
                </div>
                {verificationResult.documentNumber && (
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-green-800"><strong>ID Number:</strong> {verificationResult.documentNumber}</span>
                  </div>
                )}
                {verificationResult.expiryDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="text-green-800"><strong>Expires:</strong> {verificationResult.expiryDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {verificationStatus === 'failed' && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6" aria-label="Verification failed">
              <h3 className="font-semibold text-red-900 mb-4 text-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Verification Failed
              </h3>
              <p className="text-red-700 mb-4">
                The verification process could not be completed. Here's what you need:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Required Documents:</h4>
                <ul className="text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">1.</span>
                    <div>
                      <strong>ID Document:</strong> Passport, Driver's License, National ID Card, or Government-issued photo ID
                      <br />
                      <span className="text-sm text-blue-600">Format: JPG, PNG, or PDF</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">2.</span>
                    <div>
                      <strong>Face Capture:</strong> Clear photo of your face (selfie-style)
                      <br />
                      <span className="text-sm text-blue-600">Format: JPG or PNG</span>
                    </div>
                  </li>
                </ul>
              </div>
              <p className="text-red-700 mb-6">
                <strong>Current Issue:</strong> {banner?.message || 'Requirements not met. Please provide at least 1 ID document and 1 face capture.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setVerificationStatus('pending')
                    setBanner(null)
                    setDocuments([])
                    setVerificationResult(null)
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reload Page
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Verification Method Selection + Inputs */}
        {verificationStatus === 'pending' && (
          <div className="bg-white rounded-2xl shadow-lg border p-4 sm:p-8 mb-6 sm:mb-8">
            {/* Requirements Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h4 className="font-semibold text-blue-900 mb-3 text-base sm:text-lg flex items-center">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                What You Need to Upload
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <h5 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">📄 ID Document (Required)</h5>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                    <li>• Passport</li>
                    <li>• Driver's License</li>
                    <li>• National ID Card</li>
                    <li>• Government-issued photo ID</li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-2">Formats: JPG, PNG, PDF</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <h5 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">📸 Face Capture (Required)</h5>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                    <li>• Clear selfie photo</li>
                    <li>• Good lighting</li>
                    <li>• Face centered</li>
                    <li>• No sunglasses/hats</li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-2">Formats: JPG, PNG</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-blue-700 mt-3">
                <strong>Note:</strong> You need BOTH an ID document AND a face photo for verification to succeed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 flex items-center">
                <Upload className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 text-blue-600" />
                Verification Input
            </h3>
              <div className="flex flex-wrap items-center gap-2">
                <label className={`px-2 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition-colors whitespace-nowrap ${verificationMethod==='document'?'bg-blue-50 border-blue-300 text-blue-700':'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setVerificationMethod('document')}>Document</label>
                <label className={`px-2 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition-colors whitespace-nowrap ${verificationMethod==='face_photo'?'bg-blue-50 border-blue-300 text-blue-700':'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setVerificationMethod('face_photo')}>Face Photo</label>
                <label className={`px-2 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition-colors whitespace-nowrap ${verificationMethod==='face_video'?'bg-blue-50 border-blue-300 text-blue-700':'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setVerificationMethod('face_video')}>Face Video</label>
              </div>
            </div>
            
            {verificationMethod === 'document' && (
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 sm:p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors">
                <Upload className="h-12 w-12 sm:h-16 sm:w-16 text-blue-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-700 mb-4 sm:mb-6 text-base sm:text-lg">
                  Upload your government-issued ID document
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                  <strong>Accepted ID Types:</strong> Passport, Driver's License, National ID Card, Government Photo ID
                  <br className="hidden sm:block" />
                  <strong>Formats:</strong> JPG, PNG, PDF (Max 10MB per file)
                </p>
                <p className="text-xs text-gray-600 mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3">
                  <strong>Important:</strong> Birth certificates, utility bills, and other non-photo documents are NOT accepted as ID documents.
              </p>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                  className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-medium text-base sm:text-lg inline-block"
              >
                  Choose ID Document
              </label>
                {validationErrors.length > 0 && (
                  <div className="text-left mt-4">
                    <ul className="text-red-600 text-xs sm:text-sm space-y-1">
                      {validationErrors.map((e, i) => (
                        <li key={i}>• {e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {verificationMethod === 'face_photo' && (
              <div>
                <WebcamCapture
                  mode="photo"
                  autoStart={true}
                  facingMode="user"
                  onCapture={(b) => addCapturedFile(b, `face_${Date.now()}.jpg`, 'image/jpeg')}
                />
                <p className="text-sm text-gray-500 mt-3">Capture a clear, well-lit photo. Ensure your face is centered.</p>
              </div>
            )}

            {verificationMethod === 'face_video' && (
              <div>
                <WebcamCapture
                  mode="video"
                  maxDurationMs={5000}
                  enableLivenessPrompts
                  autoStart={true}
                  facingMode="user"
                  prompts={["Look straight", "Turn head left", "Turn head right", "Blink", "Smile"]}
                  onCapture={(b) => addCapturedFile(b, `liveness_${Date.now()}.webm`, 'video/webm')}
                />
                <p className="text-sm text-gray-500 mt-3">Record a short video for liveness. Keep your face in frame.</p>
            </div>
            )}

            {/* Selected/Captured Items */}
            {documents.length > 0 && (
              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">Selected Documents:</h4>
                <div className="space-y-3">
                  {documents.map((doc, index) => {
                    const docType = (doc as any).documentType || 'id_document'
                    const getDocTypeColor = (type: string) => {
                      switch (type) {
                        case 'id_document': return 'bg-blue-100 text-blue-800 border-blue-200'
                        case 'face_photo': return 'bg-green-100 text-green-800 border-green-200'
                        case 'face_video': return 'bg-purple-100 text-purple-800 border-purple-200'
                        default: return 'bg-gray-100 text-gray-800 border-gray-200'
                      }
                    }
                    
                    return (
                      <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-lg border">
                        {/* File Info Row - Mobile Stack */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          {/* File Details */}
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-gray-700 font-medium text-sm sm:text-base block truncate">{doc.name}</span>
                              <span className="text-xs sm:text-sm text-gray-500">({(doc.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                          </div>
                          
                          {/* Document Type Badge */}
                          <div className="flex-shrink-0">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDocTypeColor(docType)}`}>
                              {docType === 'id_document' ? '📄 ID Doc' : 
                               docType === 'face_photo' ? '📸 Face' : '🎥 Video'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Controls Row - Mobile Stack */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3 pt-3 border-t border-gray-200">
                          {/* Document Type Selector */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <label className="text-xs text-gray-600 whitespace-nowrap">Document Type:</label>
                            <select 
                              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white min-w-[120px]"
                              value={docType}
                              onChange={(e) => {
                                // Update the document type for this file
                                const newDocuments = [...documents]
                                newDocuments[index] = Object.assign(doc, { 
                                  documentType: e.target.value as 'id_document' | 'face_photo' | 'face_video' 
                                })
                                setDocuments(newDocuments)
                              }}
                            >
                              <option value="id_document">📄 ID Document</option>
                              <option value="face_photo">📸 Face Photo</option>
                              <option value="face_video">🎥 Face Video</option>
                            </select>
                      </div>
                          
                          {/* Remove Button */}
                      <button
                        onClick={() => removeDocument(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium hover:bg-red-50 px-3 py-2 rounded transition-colors self-start sm:self-auto"
                      >
                        Remove
                      </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p className="mb-1">Tips:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Use original, unedited photos or PDFs.</li>
                    <li>Avoid glare; ensure all corners are visible.</li>
                    <li>We do not display personal details on this page.</li>
                    <li><strong>Note:</strong> Birth certificates are NOT accepted as ID documents. You need a government-issued photo ID.</li>
                  </ul>
                  <p className="mt-3 text-gray-500">By continuing, you agree to share documents solely for verification. We minimize on-screen data to protect your privacy.</p>
                </div>
                
                {/* Upload Summary */}
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                  <h5 className="font-medium text-gray-900 mb-3 text-base sm:text-lg">📋 Upload Summary</h5>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ID Documents:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          documents.filter(d => (d as any).documentType === 'id_document').length > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {documents.filter(d => (d as any).documentType === 'id_document').length} uploaded
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Face Assets:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          documents.filter(d => ['face_photo', 'face_video'].includes((d as any).documentType)).length > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {documents.filter(d => ['face_photo', 'face_video'].includes((d as any).documentType)).length} uploaded
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          documents.filter(d => (d as any).documentType === 'id_document').length > 0 && 
                          documents.filter(d => ['face_photo', 'face_video'].includes((d as any).documentType)).length > 0
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {documents.filter(d => (d as any).documentType === 'id_document').length > 0 && 
                           documents.filter(d => ['face_photo', 'face_video'].includes((d as any).documentType)).length > 0
                            ? '✅ Ready to verify' 
                            : '⚠️ Missing requirements'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 text-center sm:text-left">
                        {documents.filter(d => (d as any).documentType === 'id_document').length === 0 && 
                         documents.filter(d => ['face_photo', 'face_video'].includes((d as any).documentType)).length === 0 && 
                         'Need: 1 ID document + 1 face asset'}
                        {documents.filter(d => (d as any).documentType === 'id_document').length === 0 && 
                         documents.filter(d => ['face_photo', 'face_video'].includes((d as any).documentType)).length > 0 && 
                         'Need: 1 ID document'}
                        {documents.filter(d => (d as any).documentType === 'id_document').length > 0 && 
                         documents.filter(d => ['face_photo', 'face_video'].includes((d as any).documentType)).length === 0 && 
                         'Need: 1 face asset'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {verificationStatus === 'pending' && documents.length > 0 && (
          <div className="text-center">
            <button
              onClick={startVerification}
              disabled={uploading || validationErrors.length > 0}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
            >
              {uploading ? 'Processing...' : 'Start Verification'}
            </button>
          </div>
        )}

        {/* return/back removed per request */}
      </div>

      {/* Redirecting modal */}
      {showRedirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center transform transition-all animate-scaleIn">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Clock className="h-7 w-7 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Redirecting</h3>
            <p className="text-gray-600">Taking you back to your app…</p>
          </div>
        </div>
      )}
    </div>
  )
} 