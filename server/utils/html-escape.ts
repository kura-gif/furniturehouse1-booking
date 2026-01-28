/**
 * HTMLエスケープユーティリティ
 *
 * メールテンプレートなどでユーザー入力を安全にHTML内に埋め込むために使用
 * XSS攻撃を防止する
 */

/**
 * HTMLの特殊文字をエスケープする
 * @param text エスケープする文字列
 * @returns エスケープ済みの文字列
 */
export function escapeHtml(text: string | null | undefined): string {
  if (text == null) {
    return "";
  }

  const str = String(text);

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * オブジェクトの全ての文字列プロパティをHTMLエスケープする
 * @param obj エスケープするオブジェクト
 * @returns エスケープ済みのオブジェクト
 */
export function escapeHtmlObject<T extends Record<string, unknown>>(
  obj: T,
): T {
  const result = {} as T;

  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "string") {
      (result as Record<string, unknown>)[key] = escapeHtml(value);
    } else {
      (result as Record<string, unknown>)[key] = value;
    }
  }

  return result;
}
