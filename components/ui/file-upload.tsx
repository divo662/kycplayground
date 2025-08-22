'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image, File, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'
import { FileUploadService, UploadedFile } from '@/lib/file-upload-service'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  onFileRemove?: (file: File) => void
  onFileUploaded?: (uploadedFile: UploadedFile) => void
  acceptedTypes?: string[]
  maxSize?: number // in bytes
  maxFiles?: number
  disabled?: boolean
  className?: string
  userId?: string
  documentType?: string
  enableRealUpload?: boolean
}

interface FileWithPreview extends File {
  preview?: string
  id: string
  status: 'uploading' | 'success' | 'error' | 'pending'
  progress?: number
  error?: string
}

export function FileUpload({
  onFilesSelected,
  onFileRemove,
  onFileUploaded,
  acceptedTypes = ['image/*', 'application/pdf', 'video/*'],
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  disabled = false,
  className = '',
  userId,
  documentType = 'passport',
  enableRealUpload = false
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      console.error('File rejected:', file.name, errors)
    })

    // Process accepted files
    const newFiles: FileWithPreview[] = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substring(2),
      status: 'pending' as const,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))

    const updatedFiles = [...files, ...newFiles].slice(0, maxFiles)
    setFiles(updatedFiles)
    onFilesSelected(updatedFiles)

    // Upload files to Appwrite if real upload is enabled
    if (enableRealUpload && userId) {
      newFiles.forEach(file => {
        uploadFileToAppwrite(file)
      })
    }
  }, [files, maxFiles, onFilesSelected, enableRealUpload, userId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize,
    maxFiles,
    disabled,
    onDropRejected: (rejectedFiles) => {
      console.error('Files rejected:', rejectedFiles)
    }
  })

  const removeFile = (fileToRemove: FileWithPreview) => {
    const updatedFiles = files.filter(file => file.id !== fileToRemove.id)
    setFiles(updatedFiles)
    onFileRemove?.(fileToRemove)
    
    // Clean up preview URL
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
  }

  const updateFileStatus = (fileId: string, status: FileWithPreview['status'], progress?: number, error?: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status, progress, error }
        : file
    ))
  }

  // Upload file to Appwrite if real upload is enabled
  const uploadFileToAppwrite = async (file: FileWithPreview) => {
    if (!enableRealUpload || !userId) return

    try {
      // Validate file first
      const validation = FileUploadService.validateFile(file, maxSize)
      if (!validation.valid) {
        updateFileStatus(file.id, 'error', undefined, validation.error)
        return
      }

      // Update status to uploading
      updateFileStatus(file.id, 'uploading', 0)

      // Upload file
      const result = await FileUploadService.uploadFile(
        file,
        documentType,
        userId,
        (progress) => {
          updateFileStatus(file.id, 'uploading', progress)
        }
      )

      if (result.success && result.file) {
        updateFileStatus(file.id, 'success', 100)
        onFileUploaded?.(result.file)
      } else {
        updateFileStatus(file.id, 'error', undefined, result.error)
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      updateFileStatus(file.id, 'error', undefined, error.message)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
    } else {
      return <File className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
    }
  }

  const getStatusIcon = (status: FileWithPreview['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-3 sm:p-4 md:p-6 lg:p-8 text-center transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          <Upload className="mx-auto h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-gray-400" />
          
          <div>
            <p className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop files here' : 'Upload documents'}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Drag and drop files here, or click to select files
            </p>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p className="break-words">Accepted formats: {acceptedTypes.join(', ')}</p>
            <p>Max file size: {formatFileSize(maxSize)}</p>
            <p>Max files: {maxFiles}</p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900">
            Selected Files ({files.length}/{maxFiles})
          </h3>
          
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(file)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      {getStatusIcon(file.status)}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 md:space-x-4 text-xs text-gray-500 space-y-1 sm:space-y-0">
                      <span>{formatFileSize(file.size)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate max-w-[80px] sm:max-w-none">{file.type}</span>
                      {file.status === 'uploading' && file.progress !== undefined && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span>{file.progress}%</span>
                        </>
                      )}
                    </div>

                                         {/* Progress Bar */}
                     {file.status === 'uploading' && file.progress !== undefined && (
                       <div className="mt-1.5 sm:mt-2">
                         <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                           <div
                             className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                             style={{ width: `${file.progress}%` }}
                           />
                         </div>
                       </div>
                     )}

                     {/* Error Message */}
                     {file.status === 'error' && file.error && (
                       <p className="text-xs text-red-600 mt-1 break-words">{file.error}</p>
                     )}
                  </div>
                </div>

                                 {/* Remove Button */}
                 <button
                   onClick={() => removeFile(file)}
                   className="flex-shrink-0 p-1.5 sm:p-1 text-gray-400 hover:text-red-500 transition-colors touch-manipulation"
                   disabled={file.status === 'uploading'}
                 >
                   <X className="h-4 w-4 sm:h-4 sm:w-4" />
                 </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Previews */}
      {files.some(f => f.preview) && (
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900">Previews</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {files
              .filter(f => f.preview)
              .map((file) => (
                <div key={file.id} className="relative group">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-20 sm:h-24 md:h-32 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => removeFile(file)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 sm:p-2 bg-red-500 text-white rounded-full transition-all duration-200"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Export utility functions for external use
export { updateFileStatus } from './file-upload-utils' 