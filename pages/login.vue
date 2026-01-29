<template>
  <div
    class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full">
      <!-- ロゴ・タイトル -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">家具の家 No.1</h1>
        <p class="text-gray-600">
          {{ isSignup ? "アカウント作成" : "ログイン" }}
        </p>
      </div>

      <!-- 予約フローからのリダイレクト時のメッセージ -->
      <div
        v-if="isBookingRedirect"
        class="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg"
      >
        <p class="text-sm text-purple-800">
          予約を続けるには、ログインまたはアカウント作成が必要です。
        </p>
      </div>

      <!-- エラーメッセージ（WCAG対応: role="alert", aria-live） -->
      <AlertMessage
        v-if="formErrorSummary"
        type="error"
        :message="formErrorSummary"
        class="mb-4"
        @dismiss="formErrorSummary = ''"
      />

      <!-- 成功メッセージ（WCAG対応） -->
      <AlertMessage
        v-if="successMessage"
        type="success"
        :message="successMessage"
        class="mb-4"
        @dismiss="successMessage = ''"
      />

      <!-- パスワードリセットフォーム -->
      <div v-if="showResetPassword" class="bg-white rounded-xl shadow-md p-8">
        <div v-if="!resetEmailSent">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            パスワードをリセット
          </h2>
          <p class="text-sm text-gray-600 mb-6">
            登録したメールアドレスを入力してください。パスワードリセット用のメールを送信します。
          </p>
          <form @submit.prevent="handleResetPassword" class="space-y-6" novalidate>
            <FormInput
              v-model="resetEmailField.value.value"
              label="メールアドレス"
              type="email"
              :required="true"
              placeholder="example@email.com"
              :error="resetEmailField.error.value"
              :touched="resetEmailField.touched.value"
              autocomplete="email"
              @touch="resetEmailField.touch()"
            />
            <button
              type="submit"
              :disabled="isLoading"
              :aria-busy="isLoading"
              aria-label="パスワードリセットメールを送信"
              class="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              <svg
                v-if="isLoading"
                class="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ isLoading ? "送信中..." : "リセットメールを送信" }}
            </button>
          </form>
        </div>
        <div v-else class="text-center">
          <div class="text-green-500 text-5xl mb-4">✉️</div>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">
            メールを送信しました
          </h2>
          <p class="text-sm text-gray-600 mb-6">
            {{
              resetEmailField.value.value
            }}
            にパスワードリセット用のメールを送信しました。<br />
            メールに記載されたリンクからパスワードを再設定してください。
          </p>
        </div>
        <div class="mt-6 text-center">
          <button
            @click="backToLogin"
            class="text-sm text-purple-600 hover:text-purple-800"
          >
            ← ログインに戻る
          </button>
        </div>
      </div>

      <!-- ログイン/サインアップフォーム -->
      <div v-else class="bg-white rounded-xl shadow-md p-8">
        <!-- Google ログインボタン -->
        <div class="mb-6">
          <button
            type="button"
            @click="handleGoogleLogin"
            :disabled="isLoading"
            :aria-busy="isLoading"
            :aria-label="
              isSignup ? 'Googleアカウントで登録' : 'Googleアカウントでログイン'
            "
            class="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="!isLoading"
              class="w-5 h-5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
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
            <svg
              v-else
              class="animate-spin w-5 h-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span class="text-gray-700 font-medium">
              {{
                isLoading
                  ? "処理中..."
                  : `Googleで${isSignup ? "登録" : "ログイン"}`
              }}
            </span>
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

        <form @submit.prevent="handleSubmit" class="space-y-6" novalidate>
          <!-- 名前（サインアップ時のみ） -->
          <FormInput
            v-if="isSignup"
            v-model="displayNameField.value.value"
            label="お名前"
            type="text"
            :required="true"
            placeholder="山田太郎"
            :error="displayNameField.error.value"
            :touched="displayNameField.touched.value"
            autocomplete="name"
            @touch="displayNameField.touch()"
          />

          <!-- メールアドレス -->
          <FormInput
            v-model="emailField.value.value"
            label="メールアドレス"
            type="email"
            :required="true"
            placeholder="example@email.com"
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
            :required="true"
            :minlength="6"
            placeholder="6文字以上"
            :hint="isSignup ? '6文字以上で入力してください' : ''"
            :error="passwordField.error.value"
            :touched="passwordField.touched.value"
            :autocomplete="isSignup ? 'new-password' : 'current-password'"
            @touch="passwordField.touch()"
          />

          <!-- 送信ボタン -->
          <div class="mt-2">
            <button
              type="submit"
              :disabled="isLoading || !isCurrentFormValid"
              class="w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              <svg
                v-if="isLoading"
                class="animate-spin -ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
              {{ isLoading ? "処理中..." : isSignup ? "アカウント作成" : "ログイン" }}
            </button>
          </div>
        </form>

        <!-- パスワードを忘れた方（ログイン時のみ） -->
        <div v-if="!isSignup" class="mt-4 text-center">
          <button
            @click="showResetForm"
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            パスワードを忘れた方はこちら
          </button>
        </div>

        <!-- 切り替えリンク -->
        <div class="mt-6 text-center">
          <button
            @click="toggleMode"
            class="text-sm text-purple-600 hover:text-purple-800"
          >
            {{
              isSignup
                ? "すでにアカウントをお持ちの方はこちら"
                : "新規登録はこちら"
            }}
          </button>
        </div>

        <!-- ホームに戻る -->
        <div class="mt-4 text-center">
          <NuxtLink to="/" class="text-sm text-gray-600 hover:text-gray-800">
            ← ホームに戻る
          </NuxtLink>
        </div>
      </div>

      <!-- 開発モード用の注意書き -->
      <div
        v-if="!$auth"
        class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
      >
        <p class="text-sm text-yellow-800">
          <strong>開発モード:</strong> Firebaseが設定されていません。<br />
          .envファイルにFirebase設定を追加してください。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useFieldValidation,
  useFormValidation,
  validationRules,
} from "~/composables/useFormValidation";

const { $auth } = useNuxtApp();
const { login, loginWithGoogle, signup, resetPassword } = useAuth();
const router = useRouter();
const route = useRoute();

definePageMeta({
  layout: false,
});

const isSignup = ref(false);
const isLoading = ref(false);
const showResetPassword = ref(false);
const resetEmailSent = ref(false);
const formErrorSummary = ref("");
const successMessage = ref("");

// 予約フローからのリダイレクトかどうか
const isBookingRedirect = computed(() => {
  const redirect = route.query.redirect as string;
  return redirect?.startsWith("/booking/");
});

// バリデーション付きフィールド（ログイン/サインアップ用）
const emailField = useFieldValidation("", [
  validationRules.required("メールアドレスを入力してください"),
  validationRules.email("有効なメールアドレスを入力してください"),
]);

const passwordField = useFieldValidation("", [
  validationRules.required("パスワードを入力してください"),
  validationRules.minLength(6, "パスワードは6文字以上で入力してください"),
]);

const displayNameField = useFieldValidation("", [
  validationRules.required("お名前を入力してください"),
]);

// パスワードリセット用
const resetEmailField = useFieldValidation("", [
  validationRules.required("メールアドレスを入力してください"),
  validationRules.email("有効なメールアドレスを入力してください"),
]);

// ログインフォームのバリデーション
const { isFormValid: isLoginFormValid, validateAll: validateLoginForm } = useFormValidation({
  email: emailField,
  password: passwordField,
});

// サインアップフォームのバリデーション
const { isFormValid: isSignupFormValid, validateAll: validateSignupForm } = useFormValidation({
  email: emailField,
  password: passwordField,
  displayName: displayNameField,
});

// 現在のフォームのバリデーション状態
const isCurrentFormValid = computed(() => {
  return isSignup.value ? isSignupFormValid.value : isLoginFormValid.value;
});

const toggleMode = () => {
  isSignup.value = !isSignup.value;
  showResetPassword.value = false;
  formErrorSummary.value = "";
  successMessage.value = "";
  // フィールドをリセット
  emailField.reset();
  passwordField.reset();
  displayNameField.reset();
};

const showResetForm = () => {
  showResetPassword.value = true;
  resetEmailSent.value = false;
  formErrorSummary.value = "";
  successMessage.value = "";
  resetEmailField.reset();
};

const backToLogin = () => {
  showResetPassword.value = false;
  resetEmailSent.value = false;
  formErrorSummary.value = "";
  successMessage.value = "";
};

const handleResetPassword = async () => {
  if (!$auth) {
    formErrorSummary.value = "Firebaseが設定されていません";
    return;
  }

  resetEmailField.touch();
  if (!resetEmailField.validate()) {
    return;
  }

  isLoading.value = true;
  formErrorSummary.value = "";

  try {
    await resetPassword(resetEmailField.value.value);
    resetEmailSent.value = true;
    successMessage.value =
      "パスワードリセットメールを送信しました。メールをご確認ください。";
  } catch (e: unknown) {
    const firebaseError = e as { code?: string; message?: string };
    if (firebaseError.code === "auth/user-not-found") {
      resetEmailField.error.value = "このメールアドレスは登録されていません";
      formErrorSummary.value = "登録されていないメールアドレスです。新規登録してください。";
    } else {
      formErrorSummary.value = e instanceof Error ? e.message : "エラーが発生しました";
    }
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLogin = async () => {
  if (!$auth) {
    formErrorSummary.value = "Firebaseが設定されていません";
    return;
  }

  isLoading.value = true;
  formErrorSummary.value = "";

  try {
    console.log("[Login] Starting Google login...");
    await loginWithGoogle();
    console.log("[Login] Google login successful");
    // ログイン成功後、リダイレクトURLまたはトップページへ
    const redirectUrl = (route.query.redirect as string) || "/";
    router.push(redirectUrl);
  } catch (e: unknown) {
    // エラー詳細を画面に表示（本番環境ではconsole.logが削除されるため）
    const firebaseError = e as { code?: string; message?: string };
    const errorDetail =
      firebaseError.code ||
      firebaseError.message ||
      (typeof e === "object" ? JSON.stringify(e) : String(e));
    formErrorSummary.value =
      firebaseError.message || `エラーが発生しました: ${errorDetail}`;
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!$auth) {
    formErrorSummary.value = "Firebaseが設定されていません";
    return;
  }

  // バリデーション実行
  const isValid = isSignup.value ? validateSignupForm() : validateLoginForm();
  if (!isValid) {
    formErrorSummary.value = "入力内容に問題があります。エラーを確認してください。";
    return;
  }

  isLoading.value = true;
  formErrorSummary.value = "";

  try {
    if (isSignup.value) {
      await signup(emailField.value.value, passwordField.value.value, displayNameField.value.value);
    } else {
      await login(emailField.value.value, passwordField.value.value);
    }

    // ログイン成功後、リダイレクトURLまたはトップページへ
    const redirectUrl = (route.query.redirect as string) || "/";
    router.push(redirectUrl);
  } catch (e: unknown) {
    const firebaseError = e as { code?: string; message?: string };

    // Firebase エラーコードに応じたエラーメッセージ
    if (firebaseError.code === "auth/user-not-found") {
      emailField.error.value = "このメールアドレスは登録されていません";
      emailField.touched.value = true;
      formErrorSummary.value = "このメールアドレスは登録されていません。新規登録してください。";
    } else if (firebaseError.code === "auth/wrong-password") {
      passwordField.error.value = "パスワードが正しくありません";
      passwordField.touched.value = true;
      formErrorSummary.value = "パスワードが正しくありません。";
    } else if (firebaseError.code === "auth/invalid-credential") {
      formErrorSummary.value = "メールアドレスまたはパスワードが正しくありません。";
    } else if (firebaseError.code === "auth/email-already-in-use") {
      emailField.error.value = "このメールアドレスは既に使用されています";
      emailField.touched.value = true;
      formErrorSummary.value = "このメールアドレスは既に登録されています。ログインしてください。";
    } else if (firebaseError.code === "auth/weak-password") {
      passwordField.error.value = "パスワードが弱すぎます";
      passwordField.touched.value = true;
      formErrorSummary.value = "より強力なパスワードを設定してください。";
    } else if (firebaseError.code === "auth/too-many-requests") {
      formErrorSummary.value = "ログイン試行回数が多すぎます。しばらく待ってから再試行してください。";
    } else {
      formErrorSummary.value = e instanceof Error ? e.message : "エラーが発生しました";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
