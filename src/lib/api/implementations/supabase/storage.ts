import {
  uploadFile,
  generateSignedUrl,
  getPublicUrl,
  deleteFile,
  StorageBucket,
} from '@/lib/storage'
import { IStorageRepository } from '../../interfaces/storage.interface'
import { createClient } from '@/lib/supabase/server'

export class SupabaseStorageRepository implements IStorageRepository {
  async uploadFile(
    file: File | Buffer,
    bucket: StorageBucket,
    folder: string,
    fileName: string
  ): Promise<{ path: string; error?: string }> {
    return uploadFile(file, {
      bucket,
      folder,
      fileName,
    })
  }

  async generateSignedUrl(
    bucket: StorageBucket,
    filePath: string,
    expiresIn?: number
  ): Promise<{ url: string | null; error?: string }> {
    return generateSignedUrl({
      bucket,
      filePath,
      expiresIn,
    })
  }

  async getPublicUrl(
    bucket: StorageBucket,
    filePath: string
  ): Promise<{ url: string | null }> {
    return getPublicUrl(bucket, filePath)
  }

  async deleteFile(
    bucket: StorageBucket,
    filePath: string
  ): Promise<{ success: boolean; error?: string }> {
    return deleteFile(bucket, filePath)
  }

  async listFiles(
    bucket: StorageBucket,
    folder?: string
  ): Promise<{ files: Array<{ name: string; path: string }>; error?: string }> {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder || '', { limit: 100, offset: 0 })

      if (error) {
        return { files: [], error: error.message }
      }

      const files = data
        .filter((item) => item.name !== '.emptyFolderPlaceholder')
        .map((item) => ({
          name: item.name,
          path: folder ? `${folder}/${item.name}` : item.name,
        }))

      return { files }
    } catch (error) {
      return {
        files: [],
        error: error instanceof Error ? error.message : 'Failed to list files',
      }
    }
  }
}
