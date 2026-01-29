<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <div class="max-w-md mx-auto px-4 py-16 mt-16">
      <div class="bg-white rounded-xl shadow-md p-8">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6 text-center">
          アカウントを作成
        </h1>

        <!-- 予約完了からの遷移の場合 -->
        <div
          v-if="bookingId"
          class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <p class="text-sm text-gray-700">
            <strong>予約が完了しました！</strong><br />
            アカウントを作成すると、予約の管理やホストとのメッセージができます。
          </p>
        </div>

        <!-- フォームエラーサマリー -->
        <AlertMessage
          v-if="formErrorSummary"
          type="error"
          :message="formErrorSummary"
          class="mb-6"
          @dismiss="formErrorSummary = ''"
        />

        <!-- Google ログインボタン -->
        <div class="mb-6">
          <button
            type="button"
            @click="handleGoogleSignup"
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span class="text-gray-700 font-medium">Googleで登録</span>
          </button>
        </div>

        <!-- 区切り線 -->
        <div class="relative mb-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">または</span>
          </div>
        </div>

        <form @submit.prevent="handleSignup" class="space-y-4" novalidate>
          <!-- メールアドレス -->
          <FormInput
            v-model="emailField.value.value"
            label="メールアドレス"
            type="email"
            :required="true"
            :readonly="!!prefilledEmail"
            :error="emailField.error.value"
            :touched="emailField.touched.value"
            autocomplete="email"
            @touch="emailField.touch()"
          />

          <!-- パスワード -->
          <FormInput
            v-model="passwordField.value.value"
            label="パスワード"
            type="password"
            placeholder="6文字以上"
            :required="true"
            :error="passwordField.error.value"
            :touched="passwordField.touched.value"
            :minlength="6"
            hint="6文字以上で入力してください"
            autocomplete="new-password"
            @touch="passwordField.touch()"
          />

          <!-- お名前 -->
          <FormInput
            v-model="displayNameField.value.value"
            label="お名前"
            type="text"
            placeholder="山田 太郎"
            :required="true"
            :error="displayNameField.error.value"
            :touched="displayNameField.touched.value"
            autocomplete="name"
            @touch="displayNameField.touch()"
          />

          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="w-full px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style="
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            "
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <svg
                class="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              アカウント作成中...
            </span>
            <span v-else>アカウントを作成</span>
          </button>
        </form>

        <p class="text-sm text-gray-600 text-center mt-6">
          すでにアカウントをお持ちの方は
          <NuxtLink to="/login" class="text-purple-600 hover:underline"
            >ログイン</NuxtLink
          >
        </p>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  useFieldValidation,
  useFormValidation,
  validationRules,
} from "~/composables/useFormValidation";

definePageMeta({
  layout: false,
});

const route = useRoute();
const router = useRouter();
const { $auth, $db } = useNuxtApp();
const { loginWithGoogle } = useAuth();
const toast = useToast();

// クエリパラメータから取得
const prefilledEmail = ref((route.query.email as string) || "");
const bookingId = ref((route.query.booking_id as string) || "");
const redirectPath = ref((route.query.redirect as string) || "/");

// フォームエラーサマリー（API エラー用）
const formErrorSummary = ref("");

// バリデーション付きフィールド
const emailField = useFieldValidation(prefilledEmail.value, [
  validationRules.required("メールアドレスを入力してください"),
  validationRules.email("有効なメールアドレスを入力してください"),
]);

const passwordField = useFieldValidation("", [
  validationRules.required("パスワードを入力してください"),
  validationRules.minLength(6, "パスワードは6文字以上で入力してください"),
]);

const displayNameField = useFieldValidation("", [
  validationRules.required("お名前を入力してください"),
  validationRules.minLength(1, "お名前を入力してください"),
]);

// フォーム全体のバリデーション
const { isFormValid, validateAll } = useFormValidation({
  email: emailField,
  password: passwordField,
  displayName: displayNameField,
});

const isLoading = ref(false);

const handleGoogleSignup = async () => {
  if (!$auth) {
    formErrorSummary.value = "認証サービスが初期化されていません";
    return;
  }

  isLoading.value = true;
  formErrorSummary.value = "";

  try {
    const user = await loginWithGoogle();

    if (bookingId.value && user && $db) {
      const { doc, updateDoc, Timestamp } = await import("firebase/firestore");
      await updateDoc(doc($db, "bookings", bookingId.value), {
        userId: user.uid,
        updatedAt: Timestamp.now(),
      });
    }

    // リダイレクト
    router.push(redirectPath.value);
  } catch (error: unknown) {
    console.error("Googleログインエラー:", error);
    formErrorSummary.value =
      error instanceof Error ? error.message : "Googleログインに失敗しました";
    isLoading.value = false;
  }
};

const handleSignup = async () => {
  // すべてのフィールドをバリデーション
  if (!validateAll()) {
    formErrorSummary.value = "入力内容に問題があります。エラーを確認してください。";
    return;
  }

  if (!$auth || !$db) {
    formErrorSummary.value = "認証サービスが初期化されていません";
    return;
  }

  isLoading.value = true;
  formErrorSummary.value = "";

  try {
    // Firebase Authenticationでユーザー作成
    const userCredential = await createUserWithEmailAndPassword(
      $auth,
      emailField.value.value,
      passwordField.value.value
    );
    const user = userCredential.user;

    // プロフィール更新
    await updateProfile(user, {
      displayName: displayNameField.value.value,
    });

    // Firestoreにユーザー情報を保存
    const { doc, setDoc, Timestamp } = await import("firebase/firestore");
    await setDoc(doc($db, "users", user.uid), {
      email: emailField.value.value,
      displayName: displayNameField.value.value,
      role: "user",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // 予約がある場合、予約にuserIdを紐付ける
    if (bookingId.value) {
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(doc($db, "bookings", bookingId.value), {
        userId: user.uid,
        updatedAt: Timestamp.now(),
      });
    }

    toast.success("アカウントを作成しました");

    // リダイレクト
    router.push(redirectPath.value);
  } catch (error: unknown) {
    console.error("アカウント作成エラー:", error);
    const firebaseError = error as { code?: string; message?: string };

    // Firebase エラーコードに応じたエラーメッセージ
    if (firebaseError.code === "auth/email-already-in-use") {
      emailField.error.value = "このメールアドレスは既に使用されています";
      emailField.touched.value = true;
      formErrorSummary.value = "このメールアドレスは既に登録されています。ログインするか、別のメールアドレスをお使いください。";
    } else if (firebaseError.code === "auth/weak-password") {
      passwordField.error.value = "パスワードが弱すぎます。より強力なパスワードを設定してください";
      passwordField.touched.value = true;
      formErrorSummary.value = "パスワードをより強力なものに変更してください。";
    } else if (firebaseError.code === "auth/invalid-email") {
      emailField.error.value = "メールアドレスの形式が正しくありません";
      emailField.touched.value = true;
      formErrorSummary.value = "有効なメールアドレスを入力してください。";
    } else {
      formErrorSummary.value =
        "アカウント作成に失敗しました: " +
        (firebaseError.message || "不明なエラー");
    }
    isLoading.value = false;
  }
};

// SEO設定
useHead({
  title: "アカウント作成 | 家具の家 No.1",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});
</script>
