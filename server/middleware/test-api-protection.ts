/**
 * テストAPI保護ミドルウェア
 *
 * 本番環境でテストAPIへのアクセスを制限
 */
export default defineEventHandler((event) => {
  const path = event.node.req.url || "";

  // テストAPIへのアクセスかチェック
  if (path.startsWith("/api/test/")) {
    const config = useRuntimeConfig();
    const isProduction = process.env.NODE_ENV === "production";

    // 本番環境ではテストAPIを無効化
    if (isProduction) {
      throw createError({
        statusCode: 404,
        statusMessage: "このエンドポイントは本番環境では利用できません",
      });
    }
  }
});
