import { getApps } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import { initializeFirebaseAdmin } from '~/server/utils/firebase-admin'

export default defineEventHandler(async (event) => {
  try {
    // Firebase Admin初期化
    initializeFirebaseAdmin()

    const config = useRuntimeConfig()
    let bucketName = config.public.firebaseStorageBucket

    if (!bucketName) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Storage bucket not configured'
      })
    }

    // multipart/form-dataを読み取り
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ファイルがありません'
      })
    }

    const file = formData.find(f => f.name === 'file')
    const folder = formData.find(f => f.name === 'folder')?.data.toString() || 'uploads'

    if (!file || !file.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ファイルがありません'
      })
    }

    // ファイルサイズチェック（5MB）
    if (file.data.length > 5 * 1024 * 1024) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ファイルサイズは5MB以下にしてください'
      })
    }

    // MIMEタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!file.type || !allowedTypes.includes(file.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: '許可されていないファイル形式です'
      })
    }

    // ファイル名を生成
    const ext = file.filename?.split('.').pop() || 'jpg'
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

    // Firebase Storageにアップロード
    // バケット名が gs:// で始まる場合は除去
    if (bucketName.startsWith('gs://')) {
      bucketName = bucketName.replace('gs://', '')
    }

    const app = getApps()[0]
    if (!app) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Firebase Admin not initialized'
      })
    }

    const storage = getStorage(app)
    const bucket = storage.bucket(bucketName)
    const fileRef = bucket.file(fileName)

    await fileRef.save(file.data, {
      metadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000'
      }
    })

    // 署名付きURLを取得（有効期限: 100年）
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 100 * 365 * 24 * 60 * 60 * 1000
    })

    return {
      success: true,
      url: signedUrl,
      fileName
    }
  } catch (error: any) {
    console.error('画像アップロードエラー:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || '画像のアップロードに失敗しました'
    })
  }
})
