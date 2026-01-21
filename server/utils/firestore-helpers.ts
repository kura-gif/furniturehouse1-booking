/**
 * Firestore共通ヘルパー
 * よく使うFirestore操作を一元管理
 */

import { FieldValue } from "firebase-admin/firestore";
import type {
  Firestore,
  DocumentSnapshot,
  DocumentReference,
} from "firebase-admin/firestore";

/**
 * ドキュメントを取得し、存在しない場合は404エラーをスロー
 *
 * @param db - Firestoreインスタンス
 * @param collection - コレクション名
 * @param docId - ドキュメントID
 * @param resourceName - リソース名（エラーメッセージ用）
 * @returns ドキュメント参照とデータ
 * @throws 404エラー - ドキュメントが存在しない場合
 */
export async function getDocOrThrow<T extends Record<string, unknown>>(
  db: Firestore,
  collection: string,
  docId: string,
  resourceName: string = "リソース",
): Promise<{
  ref: DocumentReference;
  doc: DocumentSnapshot;
  data: T;
}> {
  const ref = db.collection(collection).doc(docId);
  const doc = await ref.get();

  if (!doc.exists) {
    throw createError({
      statusCode: 404,
      message: `${resourceName}が見つかりません`,
    });
  }

  return {
    ref,
    doc,
    data: doc.data() as T,
  };
}

/**
 * フィールド値で最初のドキュメントを検索
 *
 * @param db - Firestoreインスタンス
 * @param collection - コレクション名
 * @param field - 検索フィールド名
 * @param value - 検索値
 * @returns ドキュメントとデータ、見つからない場合はnull
 */
export async function findFirstByField<T extends Record<string, unknown>>(
  db: Firestore,
  collection: string,
  field: string,
  value: unknown,
): Promise<{
  ref: DocumentReference;
  doc: DocumentSnapshot;
  data: T;
} | null> {
  const snapshot = await db
    .collection(collection)
    .where(field, "==", value)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    ref: doc.ref,
    doc,
    data: doc.data() as T,
  };
}

/**
 * 複数条件で最初のドキュメントを検索
 *
 * @param db - Firestoreインスタンス
 * @param collection - コレクション名
 * @param conditions - 検索条件の配列 [{field, operator, value}]
 * @returns ドキュメントとデータ、見つからない場合はnull
 */
export async function findFirstByConditions<T extends Record<string, unknown>>(
  db: Firestore,
  collection: string,
  conditions: Array<{
    field: string;
    operator: FirebaseFirestore.WhereFilterOp;
    value: unknown;
  }>,
): Promise<{
  ref: DocumentReference;
  doc: DocumentSnapshot;
  data: T;
} | null> {
  let query: FirebaseFirestore.Query = db.collection(collection);

  for (const { field, operator, value } of conditions) {
    query = query.where(field, operator, value);
  }

  const snapshot = await query.limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    ref: doc.ref,
    doc,
    data: doc.data() as T,
  };
}

/**
 * タイムスタンプ付きでデータを更新
 *
 * @param ref - ドキュメント参照
 * @param data - 更新データ
 * @param options - オプション（updatedAtを追加するかどうか）
 */
export async function updateWithTimestamp(
  ref: DocumentReference,
  data: Record<string, unknown>,
  options: { includeUpdatedAt?: boolean } = { includeUpdatedAt: true },
): Promise<void> {
  const updateData = options.includeUpdatedAt
    ? { ...data, updatedAt: FieldValue.serverTimestamp() }
    : data;

  await ref.update(updateData);
}

/**
 * 新規ドキュメント作成用のタイムスタンプを追加
 *
 * @param data - 作成データ
 * @returns タイムスタンプ付きデータ
 */
export function withCreatedTimestamps<T extends Record<string, unknown>>(
  data: T,
): T & { createdAt: FieldValue; updatedAt: FieldValue } {
  return {
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

/**
 * 更新用のタイムスタンプを追加
 *
 * @param data - 更新データ
 * @returns タイムスタンプ付きデータ
 */
export function withUpdatedTimestamp<T extends Record<string, unknown>>(
  data: T,
): T & { updatedAt: FieldValue } {
  return {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  };
}
