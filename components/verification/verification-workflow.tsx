'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, FileText, Shield, Activity } from 'lucide-react'
import { FileUpload } from '@/components/ui/file-upload'
import { aiProcessor, AIProcessingResult } from '@/lib/ai-processing'
import { DocumentService, VerificationService } from '@/lib/appwrite-service'
import { useAuthStore } from '@/lib/store'
import { DocumentType, VerificationStatus } from '@/types'
import toast from 'react-hot-toast'

interface VerificationWorkflowProps {
  onComplete?: (verificationId: string, result: AIProcessingResult) => void
  className?: string
}

interface VerificationStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  icon: React.ReactNode
}

export function VerificationWorkflow({ onComplete, className = '' }: VerificationWorkflowProps) {
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [documentType, setDocumentType] = useState<DocumentType>('passport')
  const [verificationId, setVerificationId] = useState<string>('')
  const [aiResult, setAiResult] = useState<AIProcessingResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const steps: VerificationStep[] = [
    {
      id: 'upload',
      name: 'Document Upload',
      description: 'Upload your identity document',
      status: 'pending',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'processing',
      name: 'AI Processing',
      description: 'Analyzing document with AI',
      status: 'pending',
      icon: <Activity className="h-5 w-5" />
    },
    {
      id: 'validation',
      name: 'Document Validation',
      description: 'Validating document authenticity',
      status: 'pending',
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: 'complete',
      name: 'Verification Complete',
      description: 'Review verification results',
      status: 'pending',
      icon: <CheckCircle className="h-5 w-5" />
    }
  ]

  // Update step status
  const updateStepStatus = (stepIndex: number, status: VerificationStep['status']) => {
    steps[stepIndex].status = status
  }

  // Handle file selection
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
    if (files.length > 0) {
      updateStepStatus(0, 'completed')
      setCurrentStep(1)
    }
  }

  // Start verification process
  const startVerification = async () => {
    if (!user || selectedFiles.length === 0) {
      toast.error('Please select files and ensure you are logged in')
      return
    }

    setIsProcessing(true)
    setCurrentStep(1)
    updateStepStatus(1, 'processing')

    try {
      // Upload document
      const file = selectedFiles[0]
      const uploadResult = await DocumentService.uploadDocument(file, documentType, user.$id)
      
      // Create verification record
      const verification = await VerificationService.createVerification(uploadResult.document.$id, user.$id, {
        documentType,
        enableFaceDetection: true,
        enableDocumentValidation: true,
        enableOCR: true,
        enableFraudDetection: true,
        enableLivenessDetection: true
      })

      setVerificationId(verification.$id)

      // Process with AI
      const result = await aiProcessor.processDocument(file, documentType, {
        enableFaceDetection: true,
        enableFaceRecognition: true,
        enableDocumentValidation: true,
        enableOCR: true,
        enableFraudDetection: true,
        enableLivenessDetection: true
      })

      setAiResult(result)
      updateStepStatus(1, 'completed')
      updateStepStatus(2, 'completed')
      setCurrentStep(3)

      // Update verification with results
      await VerificationService.getVerification(verification.$id)

      toast.success('Verification completed successfully!')
      onComplete?.(verification.$id, result)

    } catch (error) {
      console.error('Verification error:', error)
      updateStepStatus(1, 'error')
      updateStepStatus(2, 'error')
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Simulate progress updates
  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + Math.random() * 10
        })
      }, 500)

      return () => clearInterval(interval)
    }
  }, [isProcessing])

  const getStepIcon = (step: VerificationStep, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (step.status === 'error') {
      return <XCircle className="h-5 w-5 text-red-500" />
    } else if (step.status === 'processing') {
      return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
    } else if (index < currentStep) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else {
      return step.icon
    }
  }

  const getStepClass = (index: number) => {
    if (index < currentStep) {
      return 'text-green-600 border-green-200 bg-green-50'
    } else if (index === currentStep) {
      return 'text-blue-600 border-blue-200 bg-blue-50'
    } else {
      return 'text-gray-500 border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Steps */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Verification Process</h2>
        
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-300 ${getStepClass(index)}`}
            >
              <div className="flex-shrink-0">
                {getStepIcon(step, index)}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium">{step.name}</h3>
                <p className="text-sm opacity-75">{step.description}</p>
              </div>

              {index === currentStep && step.status === 'processing' && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Document Upload */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select Document Type</h3>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver's License</option>
                <option value="national_id">National ID</option>
                <option value="utility_bill">Utility Bill</option>
                <option value="bank_statement">Bank Statement</option>
              </select>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Document</h3>
              <FileUpload
                onFilesSelected={handleFilesSelected}
                acceptedTypes={['image/*', 'application/pdf']}
                maxSize={10 * 1024 * 1024} // 10MB
                maxFiles={1}
              />
            </div>

            {selectedFiles.length > 0 && (
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Processing
              </button>
            )}
          </div>
        )}

        {/* Step 2: Processing */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <Activity className="mx-auto h-12 w-12 text-blue-500 animate-pulse mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Document</h3>
              <p className="text-gray-600 mb-4">Our AI is analyzing your document...</p>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
            </div>

            <button
              onClick={startVerification}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Start Verification'}
            </button>
          </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && aiResult && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Verification Complete</h3>
              <p className="text-gray-600">Your document has been processed successfully</p>
            </div>

            {/* Overall Result */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-4">Overall Result</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Confidence Score</p>
                  <p className="text-2xl font-bold text-blue-600">{aiResult.overallConfidence}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Processing Time</p>
                  <p className="text-2xl font-bold text-gray-900">{aiResult.processingTime}ms</p>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              {/* Face Detection */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Face Detection
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Detected</p>
                    <p className="font-medium">{aiResult.faceDetection.detected ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Confidence</p>
                    <p className="font-medium">{(aiResult.faceDetection.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Document Validation */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Document Validation
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Valid</p>
                    <p className={`font-medium ${aiResult.documentValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {aiResult.documentValidation.isValid ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Authenticity</p>
                    <p className="font-medium">{(aiResult.documentValidation.authenticityScore * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Fraud Detection */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Fraud Detection
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Risk Level</p>
                    <p className={`font-medium ${
                      aiResult.fraudDetection.riskLevel === 'low' ? 'text-green-600' :
                      aiResult.fraudDetection.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {aiResult.fraudDetection.riskLevel.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Risk Score</p>
                    <p className="font-medium">{aiResult.fraudDetection.riskScore.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Extracted Data */}
              {aiResult.ocrResults.extractedData && Object.keys(aiResult.ocrResults.extractedData).length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Extracted Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(aiResult.ocrResults.extractedData).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setCurrentStep(0)
                  setSelectedFiles([])
                  setAiResult(null)
                  setProgress(0)
                }}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Start New Verification
              </button>
              <button
                onClick={() => {
                  // Download or share results
                  toast.success('Results saved to your dashboard')
                }}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Results
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 