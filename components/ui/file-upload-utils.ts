// File upload utility functions

export interface FileUploadStatus {
  id: string
  status: 'uploading' | 'success' | 'error' | 'pending'
  progress?: number
  error?: string
}

export const updateFileStatus = (
  files: FileUploadStatus[],
  fileId: string,
  status: FileUploadStatus['status'],
  progress?: number,
  error?: string
): FileUploadStatus[] => {
  return files.map(file =>
    file.id === fileId
      ? { ...file, status, progress, error }
      : file
  )
}

export const removeFileFromStatus = (
  files: FileUploadStatus[],
  fileId: string
): FileUploadStatus[] => {
  return files.filter(file => file.id !== fileId)
}

export const getFileUploadProgress = (files: FileUploadStatus[]): number => {
  if (files.length === 0) return 0
  
  const totalProgress = files.reduce((sum, file) => {
    if (file.status === 'success') return sum + 100
    if (file.status === 'error') return sum + 0
    return sum + (file.progress || 0)
  }, 0)
  
  return Math.round(totalProgress / files.length)
}

export const getUploadStatus = (files: FileUploadStatus[]): {
  pending: number
  uploading: number
  success: number
  error: number
} => {
  return files.reduce(
    (acc, file) => {
      acc[file.status]++
      return acc
    },
    { pending: 0, uploading: 0, success: 0, error: 0 }
  )
}

export const isUploadComplete = (files: FileUploadStatus[]): boolean => {
  return files.every(file => file.status === 'success' || file.status === 'error')
}

export const hasUploadErrors = (files: FileUploadStatus[]): boolean => {
  return files.some(file => file.status === 'error')
} 