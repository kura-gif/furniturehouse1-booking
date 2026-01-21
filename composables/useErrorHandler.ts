/**
 * エラーハンドリングユーティリティ composable
 *
 * エラーメッセージの取得、toast通知との統合を提供
 */

/**
 * 任意のエラーからメッセージを取得
 * @param error - エラーオブジェクト（unknown型を想定）
 * @param fallback - エラーメッセージが取得できない場合のフォールバック
 */
export function getErrorMessage(
  error: unknown,
  fallback = "エラーが発生しました",
): string {
  // Error インスタンス
  if (error instanceof Error) {
    return error.message;
  }

  // 文字列
  if (typeof error === "string") {
    return error;
  }

  // $fetch エラー（Nuxt）
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as { data?: { message?: string } }).data === "object"
  ) {
    const fetchError = error as {
      data?: { message?: string; statusMessage?: string };
    };
    if (fetchError.data?.message) {
      return fetchError.data.message;
    }
    if (fetchError.data?.statusMessage) {
      return fetchError.data.statusMessage;
    }
  }

  // message プロパティを持つオブジェクト
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
}

/**
 * Firebase Auth エラーコードを取得
 * @param error - エラーオブジェクト
 */
export function getFirebaseErrorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return null;
}

/**
 * Firebase Auth エラーを日本語メッセージに変換
 */
export function getFirebaseAuthErrorMessage(error: unknown): string {
  const code = getFirebaseErrorCode(error);

  const messages: Record<string, string> = {
    "auth/email-already-in-use": "このメールアドレスは既に使用されています",
    "auth/invalid-email": "無効なメールアドレスです",
    "auth/operation-not-allowed": "この操作は許可されていません",
    "auth/weak-password": "パスワードは6文字以上で入力してください",
    "auth/user-disabled": "このアカウントは無効化されています",
    "auth/user-not-found": "ユーザーが見つかりません",
    "auth/wrong-password": "パスワードが正しくありません",
    "auth/invalid-credential":
      "メールアドレスまたはパスワードが正しくありません",
    "auth/too-many-requests":
      "認証の試行回数が多すぎます。しばらく待ってから再試行してください",
    "auth/network-request-failed": "ネットワークエラーが発生しました",
    "auth/popup-closed-by-user": "ログインがキャンセルされました",
    "auth/cancelled-popup-request": "ログインがキャンセルされました",
  };

  if (code && messages[code]) {
    return messages[code];
  }

  return getErrorMessage(error, "認証エラーが発生しました");
}

/**
 * composable として使用
 */
export const useErrorHandler = () => {
  const toast = useToast();

  /**
   * エラーを処理してtoastで表示
   */
  const handleError = (
    error: unknown,
    fallbackMessage = "エラーが発生しました",
  ) => {
    const message = getErrorMessage(error, fallbackMessage);
    toast.error(message);
    console.error(message, error);
  };

  /**
   * Firebase Auth エラーを処理してtoastで表示
   */
  const handleAuthError = (error: unknown) => {
    const message = getFirebaseAuthErrorMessage(error);
    toast.error(message);
    console.error(message, error);
  };

  /**
   * 成功メッセージを表示
   */
  const showSuccess = (message: string) => {
    toast.success(message);
  };

  /**
   * 警告メッセージを表示
   */
  const showWarning = (message: string) => {
    toast.warning(message);
  };

  return {
    getErrorMessage,
    getFirebaseErrorCode,
    getFirebaseAuthErrorMessage,
    handleError,
    handleAuthError,
    showSuccess,
    showWarning,
    toast,
  };
};
