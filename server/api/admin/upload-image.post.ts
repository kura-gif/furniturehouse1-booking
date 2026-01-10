import { getStorageAdmin } from '~/server/utils/firebase-admin'

export default defineEventHandler(async (event) => {
  try {
    // multipart/form-dataを読み取り
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ファイルがありません'
      })
    }

    const file = formData.find(f => f.name === 'file')
    const folder = formData.find(f => f.name === 'folder')?.data.toString() || 'options'

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

    // Firebase Admin SDKでStorageにアップロード
    const bucket = getStorageAdmin()
    const fileRef = bucket.file(fileName)

    await fileRef.save(file.data, {
      metadata: {
        contentType: file.type
      }
    })

    // ファイルを公開アクセス可能にする
    await fileRef.makePublic()

    // 公開URLを取得
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`

    return {
      success: true,
      url: publicUrl,
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
