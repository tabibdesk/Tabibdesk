import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadFile, generateSignedUrl, StorageBucket } from '@/lib/storage'

export const runtime = 'nodejs'
export const maxDuration = 60

// POST /api/storage/upload
// Upload a file and optionally generate a signed URL
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as StorageBucket
    const folder = (formData.get('folder') as string) || ''
    const fileName = (formData.get('fileName') as string) || file.name
    const generateUrl = formData.get('generateUrl') === 'true'

    // Validate inputs
    if (!file || !bucket) {
      return NextResponse.json(
        { error: 'File and bucket are required' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer()

    // Upload file
    const uploadResult = await uploadFile(Buffer.from(buffer), {
      bucket,
      folder,
      fileName,
      contentType: file.type,
    })

    if (uploadResult.error) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 500 }
      )
    }

    const filePath = uploadResult.path

    // Generate signed URL if requested
    let signedUrl = null
    if (generateUrl) {
      const urlResult = await generateSignedUrl({
        bucket,
        filePath,
        expiresIn: 3600, // 1 hour
      })
      signedUrl = urlResult.url
    }

    return NextResponse.json({
      success: true,
      path: filePath,
      signedUrl,
      bucket,
    })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

// GET /api/storage/signed-url
// Generate a signed URL for an existing file
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bucket = searchParams.get('bucket') as StorageBucket
    const filePath = searchParams.get('filePath') as string
    const expiresIn = searchParams.get('expiresIn')
      ? parseInt(searchParams.get('expiresIn')!, 10)
      : 3600

    if (!bucket || !filePath) {
      return NextResponse.json(
        { error: 'Bucket and filePath are required' },
        { status: 400 }
      )
    }

    const result = await generateSignedUrl({
      bucket,
      filePath,
      expiresIn,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      signedUrl: result.url,
    })
  } catch (error) {
    console.error('[v0] Signed URL error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate signed URL' },
      { status: 500 }
    )
  }
}

// DELETE /api/storage/delete
// Delete a file from storage
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bucket = searchParams.get('bucket') as StorageBucket
    const filePath = searchParams.get('filePath') as string

    if (!bucket || !filePath) {
      return NextResponse.json(
        { error: 'Bucket and filePath are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })
  } catch (error) {
    console.error('[v0] Delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    )
  }
}
