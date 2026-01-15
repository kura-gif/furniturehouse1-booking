<template>
  <div>
    <!-- ヘッダー -->
    <section class="bg-amber-600 text-white py-8 px-4">
      <div class="container-responsive">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-3xl">📋</span>
          <h1 class="text-2xl font-bold">{{ $t('guestGuide.rules.title') }}</h1>
        </div>
        <p class="text-sm opacity-90">{{ $t('guestGuide.rules.subtitle') }}</p>
      </div>
    </section>

    <div class="container-responsive py-6">
      <!-- 導入文 -->
      <p class="text-sm text-gray-700 mb-6">{{ $t('guestGuide.rules.intro') }}</p>

      <!-- ルールリスト -->
      <div class="space-y-4">
        <div v-for="rule in rules" :key="rule.id" class="guide-card p-4">
          <div class="flex items-start gap-3">
            <span class="text-2xl">{{ rule.icon }}</span>
            <div>
              <h3 class="text-sm font-bold text-gray-900 mb-1">{{ $t(rule.titleKey) }}</h3>
              <p class="text-sm text-gray-600">{{ $t(rule.descKey) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 同意チェック (認証済みの場合のみ表示) -->
      <section v-if="showAgreement" class="mt-8">
        <div class="bg-gray-50 border border-gray-200 p-4">
          <label class="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              v-model="agreed"
              class="mt-1 w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <span class="text-sm text-gray-700">{{ $t('guestGuide.rules.agree') }}</span>
          </label>
          <button
            v-if="agreed"
            @click="submitAgreement"
            :disabled="submitting"
            class="mt-4 w-full py-3 bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {{ submitting ? $t('guestGuide.rules.submitting') : $t('guestGuide.rules.submit') }}
          </button>
        </div>
      </section>

      <!-- 最後のメッセージ -->
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-600">{{ $t('guestGuide.rules.enjoy') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'guide'
})

const { t } = useI18n()

// 認証状態（後で実装）
const showAgreement = ref(false)
const agreed = ref(false)
const submitting = ref(false)

const rules = [
  { id: 1, icon: '🔧', titleKey: 'guestGuide.rules.rule1.title', descKey: 'guestGuide.rules.rule1.desc' },
  { id: 2, icon: '🔥', titleKey: 'guestGuide.rules.rule2.title', descKey: 'guestGuide.rules.rule2.desc' },
  { id: 3, icon: '🏠', titleKey: 'guestGuide.rules.rule3.title', descKey: 'guestGuide.rules.rule3.desc' },
  { id: 4, icon: '🐕', titleKey: 'guestGuide.rules.rule4.title', descKey: 'guestGuide.rules.rule4.desc' },
  { id: 5, icon: '🚪', titleKey: 'guestGuide.rules.rule5.title', descKey: 'guestGuide.rules.rule5.desc' },
  { id: 6, icon: '🚭', titleKey: 'guestGuide.rules.rule6.title', descKey: 'guestGuide.rules.rule6.desc' },
  { id: 7, icon: '🌙', titleKey: 'guestGuide.rules.rule7.title', descKey: 'guestGuide.rules.rule7.desc' },
  { id: 8, icon: '🎉', titleKey: 'guestGuide.rules.rule8.title', descKey: 'guestGuide.rules.rule8.desc' },
  { id: 9, icon: '👥', titleKey: 'guestGuide.rules.rule9.title', descKey: 'guestGuide.rules.rule9.desc' },
  { id: 10, icon: '🗑️', titleKey: 'guestGuide.rules.rule10.title', descKey: 'guestGuide.rules.rule10.desc' },
  { id: 11, icon: '⏰', titleKey: 'guestGuide.rules.rule11.title', descKey: 'guestGuide.rules.rule11.desc' },
]

const submitAgreement = async () => {
  submitting.value = true
  try {
    // TODO: 同意を保存するAPIを呼び出す
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert(t('guestGuide.rules.success'))
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

useHead({
  title: t('guestGuide.rules.meta.title'),
})
</script>

<style scoped>
.guide-card {
  @apply bg-white border border-gray-100 shadow-sm;
  transition: all 0.2s ease;
}

.guide-card:hover {
  @apply shadow-md border-gray-200;
}
</style>
