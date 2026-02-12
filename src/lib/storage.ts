import { createClient } from '@/lib/supabase/server'
import { createClient as createClientBrowser } from '@/lib/supabase/client'

export type StorageBucket = 
  | 'lab-results'
  | 'payment-proofs'
  | 'prescriptions'
  | 'medical-records'
  | 'attachments'
  | 'clinic-documents'

export interface StorageUploadOptions {
  bucket: StorageBucket
  folder?: string
  fileName: string
  contentType?: string
  cacheControl?: string
}

export interface SignedUrlOptions {
  bucket: StorageBucket
  filePath: string
  expiresIn?: number // seconds, default 3600 (1 hour)
}

// Server-side: Upload file to Supabase Storage
export async function uploadFile(
  file: File | Buffer,
  options: StorageUploadOptions
): Promise<{ path: string; error?: string }> {
  try {
    const supabase = await createClient()
    
    const filePath = options.folder 
      ? `${options.folder}/${options.fileName}`
      : options.fileName

    const { error, data } = await supabase.storage
      .from(options.bucket)
      .upload(filePath, file, {
        cacheControl: options.cacheControl || '3600',
        contentType: options.contentType,
        upsert: false,
      })

    if (error) {
      return { path: '', error: error.message }
    }

    return { path: data.path }
  } catch (error) {
    return {
      path: '',
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

// Server-side: Generate signed URL for file access
export async function generateSignedUrl(
  options: SignedUrlOptions
): Promise<{ url: string | null; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.storage
      .from(options.bucket)
      .createSignedUrl(options.filePath, options.expiresIn || 3600)

    if (error) {
      return { url: null, error: error.message }
    }

    return { url: data.signedUrl }
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Failed to generate signed URL',
    }
  }
}

// Server-side: Get public URL (for public buckets)
export async function getPublicUrl(
  bucket: StorageBucket,
  filePath: string
): Promise<{ url: string | null }> {
  try {
    const supabase = await createClient()
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    return { url: data?.publicUrl || null }
  } catch {
    return { url: null }
  }
}

// Server-side: Delete file from storage
export async function deleteFile(
  bucket: StorageBucket,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}

// Client-side: Upload file using browser client
export async function uploadFileBrowser(
  file: File,
  options: StorageUploadOptions
): Promise<{ path: string; error?: string }> {
  try {
    const supabase = createClientBrowser()

    const filePath = options.folder
      ? `${options.folder}/${options.fileName}`
      : options.fileName

    const { error, data } = await supabase.storage
      .from(options.bucket)
      .upload(filePath, file, {
        cacheControl: options.cacheControl || '3600',
        contentType: options.contentType || file.type,
        upsert: false,
      })

    if (error) {
      return { path: '', error: error.message }
    }

    return { path: data.path }
  } catch (error) {
    return {
      path: '',
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

// Client-side: Download file using signed URL
export async function downloadFile(
  bucket: StorageBucket,
  filePath: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClientBrowser()

    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath)

    if (error) {
      return { success: false, error: error.message }
    }

    // Create blob URL and trigger download
    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed',
    }
  }
}

// Utility: Generate unique file name with timestamp
export function generateUniqueFileName(
  originalName: string,
  prefix?: string
): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalName.split('.').pop()
  const name = originalName.replace(/\.[^/.]+$/, '')
  
  return prefix
    ? `${prefix}/${timestamp}-${random}-${name}.${ext}`
    : `${timestamp}-${random}-${name}.${ext}`
}

// Utility: Validate file type
export function isValidFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(file.type)
}

// Utility: Validate file size (in MB)
export function isValidFileSize(
  file: File,
  maxSizeMB: number
): boolean {
  return file.size <= maxSizeMB * 1024 * 1024
}
