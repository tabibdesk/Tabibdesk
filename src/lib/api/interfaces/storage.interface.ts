import { StorageBucket } from '@/lib/storage'

export interface IStorageRepository {
  // Upload
  uploadFile(
    file: File | Buffer,
    bucket: StorageBucket,
    folder: string,
    fileName: string
  ): Promise<{ path: string; error?: string }>

  // Signed URLs
  generateSignedUrl(
    bucket: StorageBucket,
    filePath: string,
    expiresIn?: number
  ): Promise<{ url: string | null; error?: string }>

  // Public URLs
  getPublicUrl(bucket: StorageBucket, filePath: string): Promise<{ url: string | null }>

  // Delete
  deleteFile(bucket: StorageBucket, filePath: string): Promise<{ success: boolean; error?: string }>

  // List files
  listFiles(
    bucket: StorageBucket,
    folder?: string
  ): Promise<{ files: Array<{ name: string; path: string }>; error?: string }>
}
