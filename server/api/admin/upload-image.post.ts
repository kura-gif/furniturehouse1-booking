import { getStorageAdmin } from "~/server/utils/firebase-admin";

export default defineEventHandler(async (event) => {
  try {
    // multipart/form-dataを読み取り
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "ファイルがありません",
      });
    }

    const file = formData.find((f) => f.name === "file");
    const folder =
      formData.find((f) => f.name === "folder")?.data.toString() || "options";

    if (!file || !file.data) {
      throw createError({
        statusCode: 400,
        statusMessage: "ファイルがありません",
      });
    }

    // ファイルサイズチェック（5MB）
    if (file.data.length > 5 * 1024 * 1024) {
      throw createError({
        statusCode: 400,
        statusMessage: "ファイルサイズは5MB以下にしてください",
      });
    }

    // MIMEタイプチェック
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!file.type || !allowedTypes.includes(file.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: "許可されていないファイル形式です",
      });
    }

    // ファイル名を生成
    const ext = file.filename?.split(".").pop() || "jpg";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Firebase Admin SDKでStorageにアップロード
    const bucket = getStorageAdmin();
    const fileRef = bucket.file(fileName);

    await fileRef.save(file.data, {
      metadata: {
        contentType: file.type,
      },
    });

    // Firebase Storage ダウンロードトークンを使ったURLを生成
    // Signed URLを取得（長期間有効）
    const [signedUrl] = await fileRef.getSignedUrl({
      action: "read",
      expires: "01-01-2100", // 長期間有効
    });

    return {
      success: true,
      url: signedUrl,
      fileName,
    };
  } catch (error: unknown) {
    // ログには詳細を記録
    console.error("画像アップロードエラー:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorCode =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : undefined;
    console.error(
      "エラー詳細:",
      JSON.stringify(
        {
          message: errorMessage,
          code: errorCode,
        },
        null,
        2,
      ),
    );

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    // クライアントには詳細を漏洩させない
    throw createError({
      statusCode: 500,
      statusMessage: "画像のアップロードに失敗しました",
    });
  }
});
