import { useState, useCallback } from 'react'
import { StorageBucket } from '@/lib/storage'

interface UploadProgress {
  file: File
  progress: number
  status: 'idle' | 'uploading' | 'completed' | 'error'
  error?: string
  signedUrl?: string
  filePath?: string
}

interface UseFileUploadOptions {
  maxSize?: number // in MB, default 50
  allowedTypes?: string[]
  onProgress?: (progress: UploadProgress) => void
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const maxSize = options.maxSize || 50
  const allowedTypes = options.allowedTypes || ['*']
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map())

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        return `File size exceeds ${maxSize}MB limit`
      }

      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes('*')) {
        const isAllowed = allowedTypes.some((type) => {
          if (type.endsWith('/*')) {
            const category = type.split('/')[0]
            return file.type.startsWith(category)
          }
          return file.type === type
        })

        if (!isAllowed) {
          return `File type ${file.type} is not allowed`
        }
      }

      return null
    },
    [maxSize, allowedTypes]
  )

  const upload = useCallback(
    async (
      file: File,
      bucket: StorageBucket,
      folder: string,
      generateSignedUrl: boolean = true
    ): Promise<{ success: boolean; path?: string; signedUrl?: string; error?: string }> => {
      const fileId = `${file.name}-${Date.now()}`

      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        const errorProgress: UploadProgress = {
          file,
          progress: 0,
          status: 'error',
          error: validationError,
        }
        setUploads((prev) => new Map(prev).set(fileId, errorProgress))
        options.onProgress?.(errorProgress)
        return { success: false, error: validationError }
      }

      // Start upload
      const uploadingProgress: UploadProgress = {
        file,
        progress: 0,
        status: 'uploading',
      }
      setUploads((prev) => new Map(prev).set(fileId, uploadingProgress))
      options.onProgress?.(uploadingProgress)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucket', bucket)
        formData.append('folder', folder)
        formData.append('generateUrl', generateSignedUrl ? 'true' : 'false')

        const response = await fetch('/api/storage', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const data = await response.json()

        // Success
        const completedProgress: UploadProgress = {
          file,
          progress: 100,
          status: 'completed',
          filePath: data.path,
          signedUrl: data.signedUrl,
        }
        setUploads((prev) => new Map(prev).set(fileId, completedProgress))
        options.onProgress?.(completedProgress)

        return {
          success: true,
          path: data.path,
          signedUrl: data.signedUrl,
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        const errorProgress: UploadProgress = {
          file,
          progress: 0,
          status: 'error',
          error: errorMessage,
        }
        setUploads((prev) => new Map(prev).set(fileId, errorProgress))
        options.onProgress?.(errorProgress)

        return { success: false, error: errorMessage }
      }
    },
    [validateFile, options]
  )

  const getSignedUrl = useCallback(
    async (
      bucket: StorageBucket,
      filePath: string,
      expiresIn?: number
    ): Promise<{ url?: string; error?: string }> => {
      try {
        const params = new URLSearchParams({
          bucket,
          filePath,
          ...(expiresIn && { expiresIn: expiresIn.toString() }),
        })

        const response = await fetch(`/api/storage?${params}`, {
          method: 'GET',
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to generate signed URL')
        }

        const data = await response.json()
        return { url: data.signedUrl }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate signed URL'
        return { error: errorMessage }
      }
    },
    []
  )

  const deleteFile = useCallback(
    async (
      bucket: StorageBucket,
      filePath: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const params = new URLSearchParams({
          bucket,
          filePath,
        })

        const response = await fetch(`/api/storage?${params}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Delete failed')
        }

        return { success: true }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Delete failed'
        return { success: false, error: errorMessage }
      }
    },
    []
  )

  const clearUploads = useCallback(() => {
    setUploads(new Map())
  }, [])

  const clearUpload = useCallback((fileId: string) => {
    setUploads((prev) => {
      const next = new Map(prev)
      next.delete(fileId)
      return next
    })
  }, [])

  return {
    upload,
    getSignedUrl,
    deleteFile,
    uploads: Array.from(uploads.values()),
    clearUploads,
    clearUpload,
    isUploading: Array.from(uploads.values()).some((u) => u.status === 'uploading'),
  }
}
