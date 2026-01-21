<template>
  <div v-if="indoor || outdoor" class="px-4 sm:px-6 md:px-8 pb-4">
    <div
      class="bg-white max-w-md mx-auto shadow-sm"
      style="border-radius: 0 !important"
    >
      <div class="flex items-center justify-between p-4">
        <!-- 室内 -->
        <div v-if="indoor" class="flex-1 text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <svg
              class="w-4 h-4 text-organic-accent"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            <span class="text-[10px] text-organic-text-light tracking-wide"
              >室内</span
            >
          </div>
          <div class="flex items-baseline justify-center gap-0.5">
            <span class="text-2xl font-light text-organic-text">{{
              indoor.temperature
            }}</span>
            <span class="text-sm text-organic-text-light">°C</span>
          </div>
          <div class="flex items-center justify-center gap-1 mt-0.5">
            <svg
              class="w-3 h-3 text-organic-accent"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
            <span class="text-xs text-organic-text-light"
              >{{ indoor.humidity }}%</span
            >
          </div>
        </div>

        <!-- 区切り線 -->
        <div
          v-if="indoor && outdoor"
          class="w-px h-14 bg-organic-border mx-3"
        ></div>

        <!-- 屋外 -->
        <div v-if="outdoor" class="flex-1 text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <img
              v-if="outdoor.weather?.icon"
              :src="`https://openweathermap.org/img/wn/${outdoor.weather.icon}.png`"
              :alt="outdoor.weather.description"
              class="w-6 h-6 -ml-1"
            />
            <span class="text-[10px] text-organic-text-light tracking-wide"
              >山中湖</span
            >
          </div>
          <div class="flex items-baseline justify-center gap-0.5">
            <span class="text-2xl font-light text-organic-text">{{
              outdoor.temperature
            }}</span>
            <span class="text-sm text-organic-text-light">°C</span>
          </div>
          <p class="text-xs text-organic-text-light mt-0.5 text-center">
            {{ outdoor.weather?.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Indoor {
  temperature: number;
  humidity: number;
}
interface Outdoor {
  temperature: number;
  weather?: { icon: string; description: string };
}

const indoor = ref<Indoor | null>(null);
const outdoor = ref<Outdoor | null>(null);

onMounted(async () => {
  const [i, o] = await Promise.allSettled([
    $fetch("/api/weather/indoor"),
    $fetch("/api/weather/outdoor"),
  ]);
  if (i.status === "fulfilled") indoor.value = i.value as Indoor;
  if (o.status === "fulfilled") outdoor.value = o.value as Outdoor;
});
</script>
