<template>
  <div class="guide-page guide-organic-bg">
    <!-- ヘッダー -->
    <section class="bg-organic-button text-white py-8 px-4">
      <div class="max-w-md mx-auto">
        <div class="flex items-center gap-3 mb-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          <h1 class="guide-title text-2xl text-white">{{ $t('guestGuide.faq.title') }}</h1>
        </div>
        <p class="text-sm opacity-90">{{ $t('guestGuide.faq.subtitle') }}</p>
      </div>
    </section>

    <div class="max-w-md mx-auto px-4 py-6">
      <!-- FAQ リスト -->
      <div class="space-y-3">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="bg-white shadow-sm overflow-hidden"
          style="border-radius: 0 !important;"
        >
          <button
            @click="toggleFaq(index)"
            class="w-full flex items-center justify-between p-4 text-left"
          >
            <span class="text-sm font-medium text-organic-text pr-4">{{ $t(faq.questionKey) }}</span>
            <svg
              class="w-5 h-5 text-organic-text-light shrink-0 transition-transform"
              :class="{ 'rotate-180': openIndex === index }"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <Transition name="accordion">
            <div v-if="openIndex === index" class="border-t border-organic-border">
              <div class="p-4 text-sm text-organic-text-light bg-organic-cream">
                {{ $t(faq.answerKey) }}
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 解決しない場合 -->
      <section class="mt-8">
        <div class="bg-white p-4 shadow-sm" style="border-radius: 0 !important;">
          <div class="flex items-center gap-3 mb-3">
            <svg class="w-6 h-6 text-organic-accent" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <h2 class="guide-title text-base">{{ $t('guestGuide.faq.contact.title') }}</h2>
          </div>
          <p class="text-sm text-organic-text-light mb-4">{{ $t('guestGuide.faq.contact.desc') }}</p>
          <a
            href="tel:09055293078"
            class="flex items-center justify-center gap-2 w-full py-3 text-center bg-organic-button text-white font-medium hover:bg-organic-text transition-colors"
            style="border-radius: 0 !important;"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            {{ $t('guestGuide.faq.contact.call') }}
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
.guide-page {
  max-width: 100%;
  overflow-x: hidden;
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
