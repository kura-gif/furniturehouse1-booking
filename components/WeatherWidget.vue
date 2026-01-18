<template>
  <div v-if="indoor || outdoor" class="mb-6">
    <div class="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg">
      <div class="flex items-center justify-between">
        <!-- 室内 -->
        <div v-if="indoor" class="flex-1 text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            <span class="text-xs text-slate-400 uppercase tracking-wide">室内</span>
          </div>
          <div class="flex items-baseline justify-center gap-1">
            <span class="text-3xl font-light">{{ indoor.temperature }}</span>
            <span class="text-lg text-slate-400">°C</span>
          </div>
          <div class="flex items-center justify-center gap-1 mt-1">
            <svg class="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4 4 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm text-slate-300">{{ indoor.humidity }}%</span>
          </div>
        </div>

        <!-- 区切り線 -->
        <div v-if="indoor && outdoor" class="w-px h-16 bg-slate-600 mx-4"></div>

        <!-- 屋外 -->
        <div v-if="outdoor" class="flex-1 text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <img
              v-if="outdoor.weather?.icon"
              :src="`https://openweathermap.org/img/wn/${outdoor.weather.icon}.png`"
              :alt="outdoor.weather.description"
              class="w-6 h-6 -ml-1"
            />
            <span class="text-xs text-slate-400 uppercase tracking-wide">山中湖</span>
          </div>
          <div class="flex items-baseline justify-center gap-1">
            <span class="text-3xl font-light">{{ outdoor.temperature }}</span>
            <span class="text-lg text-slate-400">°C</span>
          </div>
          <p class="text-sm text-slate-300 mt-1 text-center">{{ outdoor.weather?.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Indoor { temperature: number; humidity: number }
interface Outdoor { temperature: number; weather?: { icon: string; description: string } }

const indoor = ref<Indoor | null>(null)
const outdoor = ref<Outdoor | null>(null)

onMounted(async () => {
  const [i, o] = await Promise.allSettled([
    $fetch('/api/weather/indoor'),
    $fetch('/api/weather/outdoor')
  ])
  if (i.status === 'fulfilled') indoor.value = i.value as Indoor
  if (o.status === 'fulfilled') outdoor.value = o.value as Outdoor
})
</script>
