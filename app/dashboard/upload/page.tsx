'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Upload, FileText, CheckCircle, Eye, Shield, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { FileUpload } from '@/components/ui/file-upload'
import { VerificationWorkflow } from '@/components/verification/verification-workflow'
import { useAuthStore } from '@/lib/store'
import { DocumentType } from '@/types'
import { FileUploadService, UploadedFile } from '@/lib/file-upload-service'
import toast from 'react-hot-toast'

export default function UploadPage() {
  const { user } = useAuthStore()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [documentType, setDocumentType] = useState<DocumentType>('passport')
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load user's existing files
  useEffect(() => {
    if (user) {
      loadUserFiles()
    }
  }, [user])

  const loadUserFiles = async () => {
    try {
      setLoading(true)
      const files = await FileUploadService.getUserFiles(user!.$id)
      setUploadedFiles(files)
    } catch (error: any) {
      console.error('Error loading user files:', error)
      toast.error('Failed to load existing files')
    } finally {
      setLoading(false)
    }
  }

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
  }

  const handleFileUploaded = (uploadedFile: UploadedFile) => {
    setUploadedFiles(prev => [uploadedFile, ...prev])
    toast.success(`File ${uploadedFile.fileName} uploaded successfully!`)
  }

  const handleFileRemove = async (file: UploadedFile) => {
    try {
      await FileUploadService.deleteFile(file.$id)
      setUploadedFiles(prev => prev.filter(f => f.$id !== file.$id))
      toast.success('File deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting file:', error)
      toast.error('Failed to delete file')
    }
  }

  const handleVerificationComplete = (verificationId: string, result: any) => {
    toast.success(`Verification ${verificationId} completed successfully!`)
    // You can redirect to results page or update dashboard
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to upload documents</p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Document Upload & Verification</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showWorkflow ? (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-3 mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Upload Your Documents</h2>
              </div>
              <p className="text-gray-600">
                Upload your identity documents for AI-powered verification. Our system will analyze your documents 
                for authenticity, extract information, and provide detailed verification results.
              </p>
            </div>

            {/* Document Type Selection */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Document Type</h3>
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

            {/* File Upload */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
              <FileUpload
                onFilesSelected={handleFilesSelected}
                onFileUploaded={handleFileUploaded}
                acceptedTypes={['image/*', 'application/pdf']}
                maxSize={10 * 1024 * 1024} // 10MB
                maxFiles={1}
                userId={user.$id}
                documentType={documentType}
                enableRealUpload={true}
              />
            </div>

            {/* Start Verification Button */}
            {selectedFiles.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Ready to Verify</h3>
                      <p className="text-gray-600">
                        {selectedFiles.length} document selected for verification
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWorkflow(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Verification
                  </button>
                </div>
              </div>
            )}

            {/* Existing Files */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Uploaded Documents</h3>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.$id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">{file.fileName}</p>
                          <p className="text-sm text-gray-500">
                            {file.documentType} • {formatFileSize(file.fileSize)} • {file.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleFileRemove(file)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center space-x-3 mb-3">
                  <Eye className="h-6 w-6 text-blue-500" />
                  <h3 className="font-medium text-gray-900">Face Detection</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Advanced AI detects and analyzes faces in your documents
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="h-6 w-6 text-green-500" />
                  <h3 className="font-medium text-gray-900">Document Validation</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Verify document authenticity and detect tampering
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center space-x-3 mb-3">
                  <FileText className="h-6 w-6 text-purple-500" />
                  <h3 className="font-medium text-gray-900">OCR Processing</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Extract text and data from your documents automatically
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowWorkflow(false)}
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Upload</span>
              </button>
            </div>

            {/* Verification Workflow */}
            <VerificationWorkflow
              onComplete={handleVerificationComplete}
              className="bg-white p-6 rounded-lg shadow-sm border"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 