<template>
  <div>
    <!-- ヘッダー -->
    <section class="bg-gray-900 text-white py-8 px-4">
      <div class="container-responsive">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-3xl">❓</span>
          <h1 class="text-2xl font-bold">{{ $t('guestGuide.faq.title') }}</h1>
        </div>
        <p class="text-sm opacity-90">{{ $t('guestGuide.faq.subtitle') }}</p>
      </div>
    </section>

    <div class="container-responsive py-6">
      <!-- FAQ リスト -->
      <div class="space-y-3">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="guide-card overflow-hidden"
        >
          <button
            @click="toggleFaq(index)"
            class="w-full flex items-center justify-between p-4 text-left"
          >
            <span class="text-sm font-semibold text-gray-900 pr-4">{{ $t(faq.questionKey) }}</span>
            <svg
              class="w-5 h-5 text-gray-400 shrink-0 transition-transform"
              :class="{ 'rotate-180': openIndex === index }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <Transition name="accordion">
            <div v-if="openIndex === index" class="border-t border-gray-100">
              <div class="p-4 text-sm text-gray-700 bg-gray-50">
                {{ $t(faq.answerKey) }}
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 解決しない場合 -->
      <section class="mt-8">
        <div class="guide-card p-4">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">💬</span>
            <h2 class="text-base font-bold text-gray-900">{{ $t('guestGuide.faq.contact.title') }}</h2>
          </div>
          <p class="text-sm text-gray-600 mb-4">{{ $t('guestGuide.faq.contact.desc') }}</p>
          <a
            href="tel:09055293078"
            class="block w-full py-3 text-center bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
          >
            📞 {{ $t('guestGuide.faq.contact.call') }}
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'guide'
})

const { t } = useI18n()
const openIndex = ref<number | null>(null)

const faqs = [
  { questionKey: 'guestGuide.faq.q1', answerKey: 'guestGuide.faq.a1' },
  { questionKey: 'guestGuide.faq.q2', answerKey: 'guestGuide.faq.a2' },
  { questionKey: 'guestGuide.faq.q3', answerKey: 'guestGuide.faq.a3' },
  { questionKey: 'guestGuide.faq.q4', answerKey: 'guestGuide.faq.a4' },
  { questionKey: 'guestGuide.faq.q5', answerKey: 'guestGuide.faq.a5' },
  { questionKey: 'guestGuide.faq.q6', answerKey: 'guestGuide.faq.a6' },
  { questionKey: 'guestGuide.faq.q7', answerKey: 'guestGuide.faq.a7' },
]

const toggleFaq = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index
}

useHead({
  title: t('guestGuide.faq.meta.title'),
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

.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>
