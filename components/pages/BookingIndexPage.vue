<template>
  <div class="min-h-screen bg-white">
    <!-- ヘッダー -->
    <AppHeader />

    <!-- メインコンテンツ -->
    <div class="max-w-[1280px] mx-auto px-6 md:px-12 py-8">
      <!-- 画像ギャラリー -->
      <div class="mb-8">
        <div class="grid grid-cols-4 gap-2 h-[400px] md:h-[500px] rounded-lg overflow-hidden relative">
          <!-- メイン画像 (左側大きく) -->
          <div
            @click="openPhotoTour"
            class="col-span-4 md:col-span-2 row-span-2 relative group cursor-pointer"
          >
            <div
              class="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              :style="`background-image: url('${displayPhotos[0]?.url || images.gallery[0]?.src}');`"
            ></div>
          </div>
          <!-- サブ画像 (右側4枚) -->
          <div
            v-for="(photo, index) in displayPhotos.slice(1, 5)"
            :key="photo.id || index"
            @click="openPhotoTour"
            class="hidden md:block col-span-1 relative group cursor-pointer overflow-hidden"
          >
            <div
              class="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              :style="`background-image: url('${photo.url}');`"
            ></div>
          </div>

          <!-- すべての写真を表示ボタン -->
          <button
            @click="openPhotoTour"
            class="absolute bottom-4 right-4 px-4 py-2 bg-white border border-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            type="button"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            すべての写真を表示
          </button>
        </div>
      </div>

      <!-- 写真ツアーモーダル（スクロール型） -->
      <div v-if="showPhotoTour" class="fixed inset-0 z-50 bg-white">
        <!-- 固定ヘッダー -->
        <div class="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3 flex items-center justify-between">
          <button @click="closePhotoTour" class="p-2 hover:bg-gray-100 rounded-full transition-colors" type="button">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div class="text-sm text-gray-600">
            {{ displayPhotos.length }}枚の写真
          </div>
          <button @click="sharePhoto" class="p-2 hover:bg-gray-100 rounded-full transition-colors" type="button">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        <!-- スクロール可能な写真一覧 -->
        <div class="h-[calc(100vh-57px)] overflow-y-auto">
          <div class="max-w-4xl mx-auto px-4 py-6 space-y-6">
            <div
              v-for="(photo, index) in displayPhotos"
              :key="photo.id"
              class="space-y-2"
            >
              <img
                :src="photo.url"
                :alt="photo.title"
                class="w-full h-auto rounded-lg"
                loading="lazy"
              />
              <div class="px-1">
                <h3 class="font-medium text-gray-900">{{ photo.title }}</h3>
                <p v-if="photo.description" class="text-sm text-gray-600">{{ photo.description }}</p>
                <p v-if="photo.credit" class="text-xs text-gray-400 mt-1">
                  <a
                    v-if="photo.credit.includes('instagram.com') || photo.credit.startsWith('@')"
                    :href="photo.credit.startsWith('@') ? `https://instagram.com/${photo.credit.slice(1)}` : photo.credit"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:text-gray-600 hover:underline"
                  >
                    {{ photo.credit.startsWith('http') ? photo.credit.split('/').pop() : photo.credit }}
                  </a>
                  <span v-else>{{ photo.credit }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- メインコンテンツエリア（左: 詳細情報、右: 予約カード） -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <!-- 左側: 詳細情報 -->
        <div class="lg:col-span-2 space-y-10">
          <!-- 基本情報 -->
          <section class="pb-8 border-b border-gray-200">
            <h2 class="text-2xl font-medium mb-4" style="color: #231815; font-weight: 500;">
              1日1組限定・完全貸切の建築体験
            </h2>
            <p class="text-base text-gray-700 mb-4" style="line-height: 1.8;">
              世界的建築家・坂茂が1995年に設計した「家具の家 No.1」。家具そのものが構造体となる革新的な建築に、実際に宿泊できる貴重な体験です。
            </p>
            <div class="flex flex-wrap gap-4 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>最大6名</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>約100㎡</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                <span>寝室2室（和室・洋室）</span>
              </div>
            </div>
          </section>

          <!-- 設備・アメニティ -->
          <section class="pb-8 border-b border-gray-200">
            <h2 class="text-xl font-medium mb-6" style="color: #231815; font-weight: 500;">
              提供設備
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="amenity in displayedAmenities"
                :key="amenity.id"
                class="flex items-start gap-3"
              >
                <component :is="getIconComponent(amenity.icon)" class="w-6 h-6 text-gray-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-medium text-gray-900">{{ amenity.name }}</p>
                  <p v-if="amenity.description" class="text-sm text-gray-600">{{ amenity.description }}</p>
                </div>
              </div>
            </div>

            <button
              @click="showAllAmenities = true"
              class="mt-6 px-6 py-3 border-2 border-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              type="button"
            >
              設備をすべて表示
            </button>
          </section>

          <!-- アメニティモーダル -->
          <div v-if="showAllAmenities" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="showAllAmenities = false">
            <div @click.stop class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
              <!-- モーダルヘッダー -->
              <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 class="text-xl font-medium" style="color: #231815;">提供設備・アメニティ</h3>
                <button @click="showAllAmenities = false" class="p-2 hover:bg-gray-100 rounded-full" type="button">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- モーダルコンテンツ -->
              <div class="p-6">
                <div
                  v-for="(categoryAmenities, category) in amenitiesByCategory"
                  :key="category"
                  class="mb-8 last:mb-0"
                >
                  <h4 class="text-lg font-medium mb-4" style="color: #231815;">
                    {{ amenityCategories[category] }}
                  </h4>
                  <div class="space-y-4">
                    <div
                      v-for="amenity in categoryAmenities"
                      :key="amenity.id"
                      class="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
                    >
                      <component :is="getIconComponent(amenity.icon)" class="w-7 h-7 text-gray-700 flex-shrink-0" />
                      <div class="flex-1">
                        <p class="font-medium text-gray-900">{{ amenity.name }}</p>
                        <p v-if="amenity.description" class="text-sm text-gray-600 mt-1">{{ amenity.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- レビュー -->
          <section class="pb-8 border-b border-gray-200">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1">
                  <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span class="text-xl font-medium">{{ averageRating > 0 ? averageRating.toFixed(1) : '5.0' }}</span>
                </div>
                <span class="text-gray-600">（{{ approvedReviews.length }}件のレビュー）</span>
              </div>
              <NuxtLink
                v-if="user"
                to="/reviews/new"
                class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90"
                style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
              >
                レビューを書く
              </NuxtLink>
            </div>

            <div v-if="approvedReviews.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="review in approvedReviews.slice(0, 4)"
                :key="review.id"
                class="space-y-2"
              >
                <div class="flex items-center justify-between">
                  <p class="font-medium text-gray-900">{{ review.userName }}</p>
                  <p class="text-sm text-gray-500">{{ review.stayDate || formatReviewDate(review.createdAt) }}</p>
                </div>
                <div class="flex items-center gap-1">
                  <span v-for="star in review.rating" :key="star" class="text-yellow-500">★</span>
                </div>
                <p class="text-sm text-gray-700 line-clamp-3" style="line-height: 1.6;">
                  {{ review.comment }}
                </p>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <p>まだレビューがありません</p>
            </div>

            <NuxtLink
              v-if="approvedReviews.length > 4"
              to="/reviews"
              class="mt-6 text-base font-medium underline hover:text-gray-600 transition-colors inline-block"
            >
              すべてのレビューを表示
            </NuxtLink>
          </section>

          <!-- 注意事項 -->
          <section class="pb-8">
            <h2 class="text-xl font-medium mb-6" style="color: #231815; font-weight: 500;">
              ご利用上の注意
            </h2>
            <ul class="space-y-3 text-sm text-gray-700">
              <li class="flex items-start gap-3">
                <span class="text-gray-400 mt-1">•</span>
                <span>チェックイン: {{ facilitySettings.checkInTime }}〜 / チェックアウト: 〜{{ facilitySettings.checkOutTime }}</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-gray-400 mt-1">•</span>
                <span>建築物保護のため、土足厳禁・禁煙です</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-gray-400 mt-1">•</span>
                <span>ペット同伴不可</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-gray-400 mt-1">•</span>
                <span>イベント・パーティー利用不可</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-gray-400 mt-1">•</span>
                <span>送迎サービスはございません</span>
              </li>
            </ul>
          </section>
        </div>

        <!-- 右側: 予約カード（スティッキー） -->
        <div class="lg:col-span-1">
          <div class="sticky top-24">
            <div class="border border-gray-300 rounded-xl p-6 shadow-lg">
              <div class="mb-6">
                <div class="flex items-baseline gap-2 mb-2">
                  <span class="text-2xl font-medium" style="color: #231815;">¥{{ totalPrice.toLocaleString() }}</span>
                  <span class="text-gray-600">（{{ nights }}泊）</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span class="font-medium">{{ averageRating > 0 ? averageRating.toFixed(1) : '5.0' }}</span>
                  </div>
                  <span class="text-gray-500">（{{ approvedReviews.length }}件）</span>
                </div>
              </div>

              <!-- 日付・人数選択フォーム -->
              <div class="border border-gray-300 rounded-lg mb-4 relative">
                <!-- チェックイン・チェックアウト -->
                <div class="grid grid-cols-2 border-b border-gray-300">
                  <button
                    @click="showCalendar = !showCalendar"
                    class="p-3 border-r border-gray-300 text-left hover:bg-gray-50 transition-colors"
                    type="button"
                  >
                    <label class="block text-xs font-semibold mb-1">チェックイン</label>
                    <span class="text-sm text-gray-700">{{ checkInDate ? formatDate(checkInDate) : '日付を選択' }}</span>
                  </button>
                  <button
                    @click="showCalendar = !showCalendar"
                    class="p-3 text-left hover:bg-gray-50 transition-colors"
                    type="button"
                  >
                    <label class="block text-xs font-semibold mb-1">チェックアウト</label>
                    <span class="text-sm text-gray-700">{{ checkOutDate ? formatDate(checkOutDate) : '日付を選択' }}</span>
                  </button>
                </div>

                <!-- カレンダーモーダル -->
                <div v-if="showCalendar" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25 p-4" @click="showCalendar = false">
                  <div @click.stop class="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 md:p-6 w-full max-w-[340px] md:max-w-[700px]">
                  <!-- カレンダーヘッダー -->
                  <div class="flex items-center justify-between mb-4 md:mb-6">
                    <button @click="previousMonth" class="p-2 hover:bg-gray-100 rounded-full transition-colors" type="button">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div class="flex gap-4 md:gap-12">
                      <span class="font-semibold text-sm md:text-base">{{ currentMonthName }}</span>
                      <span class="font-semibold text-sm md:text-base hidden md:block">{{ nextMonthName }}</span>
                    </div>
                    <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-full transition-colors" type="button">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <!-- カレンダー（モバイル: 1ヶ月、デスクトップ: 2ヶ月） -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                    <!-- 当月 -->
                    <div>
                      <div class="grid grid-cols-7 gap-1 mb-2">
                        <div v-for="day in ['日', '月', '火', '水', '木', '金', '土']" :key="day" class="text-center text-xs font-semibold text-gray-600 py-2">
                          {{ day }}
                        </div>
                      </div>
                      <div class="grid grid-cols-7 gap-1">
                        <button
                          v-for="date in currentMonthDates"
                          :key="date.key"
                          @click="selectDate(date)"
                          :disabled="date.disabled"
                          :class="[
                            'aspect-square flex items-center justify-center text-sm rounded-full transition-all',
                            date.disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:border-2 hover:border-gray-900',
                            date.isSelected ? 'bg-gray-900 text-white' : '',
                            date.isInRange ? 'bg-gray-100' : '',
                            date.isEmpty ? 'invisible' : ''
                          ]"
                          type="button"
                        >
                          {{ date.day }}
                        </button>
                      </div>
                    </div>

                    <!-- 翌月（デスクトップのみ表示） -->
                    <div class="hidden md:block">
                      <div class="grid grid-cols-7 gap-1 mb-2">
                        <div v-for="day in ['日', '月', '火', '水', '木', '金', '土']" :key="day" class="text-center text-xs font-semibold text-gray-600 py-2">
                          {{ day }}
                        </div>
                      </div>
                      <div class="grid grid-cols-7 gap-1">
                        <button
                          v-for="date in nextMonthDates"
                          :key="date.key"
                          @click="selectDate(date)"
                          :disabled="date.disabled"
                          :class="[
                            'aspect-square flex items-center justify-center text-sm rounded-full transition-all',
                            date.disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:border-2 hover:border-gray-900',
                            date.isSelected ? 'bg-gray-900 text-white' : '',
                            date.isInRange ? 'bg-gray-100' : '',
                            date.isEmpty ? 'invisible' : ''
                          ]"
                          type="button"
                        >
                          {{ date.day }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- カレンダーフッター -->
                  <div class="flex items-center justify-between mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                    <button @click="clearDates" class="text-sm font-medium underline hover:text-gray-600" type="button">
                      日付をクリア
                    </button>
                    <button @click="showCalendar = false" class="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors" type="button">
                      閉じる
                    </button>
                  </div>
                  </div>
                </div>

                <!-- 人数選択 -->
                <div class="p-3">
                  <button
                    @click="showGuestPicker = !showGuestPicker"
                    class="w-full flex items-center justify-between"
                    type="button"
                  >
                    <div class="text-left">
                      <label class="block text-xs font-semibold mb-1">人数</label>
                      <span class="text-sm">{{ totalGuests }}人</span>
                    </div>
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <!-- ゲスト数選択ドロップダウン -->
                  <div v-if="showGuestPicker" class="mt-4 space-y-4">
                    <!-- 大人（16歳以上） -->
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-medium text-sm">大人</p>
                        <p class="text-xs text-gray-500">16歳以上</p>
                      </div>
                      <div class="flex items-center gap-3">
                        <button
                          @click="adults > 1 && adults--"
                          :disabled="adults <= 1"
                          class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          type="button"
                        >
                          <span class="text-lg">−</span>
                        </button>
                        <span class="w-6 text-center">{{ adults }}</span>
                        <button
                          @click="adults < 4 && adults++"
                          :disabled="totalGuests >= 4"
                          class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          type="button"
                        >
                          <span class="text-lg">+</span>
                        </button>
                      </div>
                    </div>

                    <!-- 子ども（7〜15歳） -->
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-medium text-sm">子ども</p>
                        <p class="text-xs text-gray-500">7〜15歳（大人料金の50%）</p>
                      </div>
                      <div class="flex items-center gap-3">
                        <button
                          @click="children > 0 && children--"
                          :disabled="children <= 0"
                          class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          type="button"
                        >
                          <span class="text-lg">−</span>
                        </button>
                        <span class="w-6 text-center">{{ children }}</span>
                        <button
                          @click="children++"
                          :disabled="totalGuests >= 4"
                          class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          type="button"
                        >
                          <span class="text-lg">+</span>
                        </button>
                      </div>
                    </div>

                    <!-- 乳幼児（0〜6歳） -->
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-medium text-sm">乳幼児</p>
                        <p class="text-xs text-gray-500">0〜6歳（無料）</p>
                      </div>
                      <div class="flex items-center gap-3">
                        <button
                          @click="infants > 0 && infants--"
                          :disabled="infants <= 0"
                          class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          type="button"
                        >
                          <span class="text-lg">−</span>
                        </button>
                        <span class="w-6 text-center">{{ infants }}</span>
                        <button
                          @click="infants++"
                          :disabled="totalGuests >= 4"
                          class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          type="button"
                        >
                          <span class="text-lg">+</span>
                        </button>
                      </div>
                    </div>

                    <p class="text-xs text-gray-500">最大6名まで</p>
                  </div>
                </div>
              </div>

              <button
                @click="handleReservation"
                class="block w-full py-3 px-6 text-center text-white font-medium rounded-lg transition-all transform hover:-translate-y-0.5 hover:shadow-xl"
                style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
                type="button"
              >
                予約する
              </button>

              <p class="text-center text-sm text-gray-500 mt-4">
                予約確定前に料金は発生しません
              </p>

              <div v-if="nights > 0" class="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">¥30,000 × {{ nights }}泊</span>
                  <span class="text-gray-900">¥{{ (30000 * nights).toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">清掃料金</span>
                  <span class="text-gray-900">¥5,000</span>
                </div>
                <div class="flex justify-between pt-3 border-t border-gray-200 font-medium">
                  <span>合計</span>
                  <span>¥{{ totalPrice.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- アクセス情報カード -->
            <div class="mt-6 border border-gray-300 rounded-xl p-6">
              <h3 class="font-medium mb-4" style="color: #231815;">アクセス</h3>
              <div class="space-y-3 text-sm text-gray-700">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">山中湖エリア</p>
                    <p class="text-gray-600 mt-1">詳細住所は予約確定後にお知らせ</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">お車の場合</p>
                    <p class="text-gray-600 mt-1">東京から約2時間<br />中央道 山中湖ICより15分</p>
                  </div>
                </div>
                <NuxtLink to="/access" class="text-sm font-medium underline hover:text-gray-600 mt-2 transition-colors inline-block">
                  アクセス詳細を見る
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 施設情報 -->
      <section class="mt-16 pt-8 border-t border-gray-200">
        <h2 class="text-2xl font-medium mb-8 text-center" style="color: #231815; font-weight: 500;">
          施設情報
        </h2>
        <div class="max-w-3xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
            <div class="flex justify-between py-3 border-b border-gray-200">
              <span class="text-gray-600">用途</span>
              <span class="text-gray-900 font-medium">保養所</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-200">
              <span class="text-gray-600">設計</span>
              <span class="text-gray-900 font-medium">坂茂建築設計</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-200">
              <span class="text-gray-600">所在</span>
              <span class="text-gray-900 font-medium">山梨県 山中湖村</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-200">
              <span class="text-gray-600">竣工</span>
              <span class="text-gray-900 font-medium">1995年</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-200">
              <span class="text-gray-600">構造</span>
              <span class="text-gray-900 font-medium">木造平屋</span>
            </div>
            <div class="flex justify-between py-3 border-b border-gray-200">
              <span class="text-gray-600">面積</span>
              <span class="text-gray-900 font-medium">約100㎡</span>
            </div>
          </div>
        </div>
      </section>

      <!-- キャンセルポリシー & ハウスルール -->
      <section class="mt-16 pt-8 border-t border-gray-200">
        <h2 class="text-2xl font-medium mb-8" style="color: #231815; font-weight: 500;">
          知っておきたいこと
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- キャンセルポリシー -->
          <div>
            <h3 class="text-base font-medium mb-4" style="color: #231815;">キャンセルポリシー</h3>
            <div class="space-y-3 text-sm text-gray-700">
              <p>利用日の<strong>3日前まで</strong>：無料キャンセル</p>
              <p>利用日の<strong>2日前〜当日</strong>：100%</p>
              <p><strong>無断キャンセル</strong>：100%</p>
              <NuxtLink to="/cancellation-policy" class="text-sm font-medium underline hover:text-gray-600 mt-4 transition-colors inline-block">
                詳細を見る
              </NuxtLink>
            </div>
          </div>

          <!-- ハウスルール -->
          <div>
            <h3 class="text-base font-medium mb-4" style="color: #231815;">ハウスルール</h3>
            <div class="space-y-3 text-sm text-gray-700">
              <p>チェックイン：{{ facilitySettings.checkInTime }}〜</p>
              <p>チェックアウト：{{ facilitySettings.checkOutTime }}まで</p>
              <p>最大宿泊人数：{{ facilitySettings.maxGuests }}名</p>
              <p>ペット同伴不可</p>
              <p>喫煙不可</p>
              <NuxtLink to="/house-rules" class="text-sm font-medium underline hover:text-gray-600 mt-4 transition-colors inline-block">
                詳細を見る
              </NuxtLink>
            </div>
          </div>

          <!-- 周辺情報・おすすめスポット -->
          <div>
            <h3 class="text-base font-medium mb-4" style="color: #231815;">周辺情報・おすすめスポット</h3>
            <div class="space-y-3 text-sm text-gray-700">
              <p>レストラン・飲食店</p>
              <p>観光スポット</p>
              <p>コンビニ・スーパー</p>
              <p>アクセス情報</p>
              <NuxtLink to="/neighborhood" class="text-sm font-medium underline hover:text-gray-600 mt-4 transition-colors inline-block">
                詳細を見る
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- プライバシーポリシー & 法的事項 -->
      <section class="mt-12 pt-8 border-t border-gray-200">
        <div class="max-w-3xl text-sm text-gray-600 space-y-4">
          <p>
            ご予約の際は、
            <a href="/terms" class="underline hover:text-gray-900 transition-colors">利用規約</a>、
            <a href="/privacy" class="underline hover:text-gray-900 transition-colors">プライバシーポリシー</a>、
            <a href="/cancellation-policy" class="underline hover:text-gray-900 transition-colors">キャンセルポリシー</a>
            に同意したものとみなされます。
          </p>
          <p>
            この宿泊施設は貴重な建築物であり、特別な保護を必要とします。ご利用の際は建築物の保全にご協力いただきますようお願いいたします。
          </p>
        </div>
      </section>

      <!-- CTAセクション -->
      <section class="mt-16 mb-12 py-12 px-8 rounded-2xl text-center" style="background: linear-gradient(135deg, #f8f7f5 0%, #ebe8e6 100%);">
        <h2 class="text-2xl md:text-3xl font-medium mb-4" style="color: #231815; font-weight: 500;">
          体験する建築で、特別な時間を
        </h2>
        <p class="text-gray-700 mb-8 max-w-2xl mx-auto" style="line-height: 1.8;">
          家具が家を支え、風が通り抜ける空間。<br />
          1日1組限定で、この唯一無二の建築体験をお楽しみいただけます。
        </p>
        <button
          @click="goToBooking"
          class="inline-block py-4 px-12 text-white font-medium rounded-lg transition-all transform hover:-translate-y-1 hover:shadow-xl text-lg cursor-pointer"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
        >
          宿泊予約へ進む
        </button>
      </section>
    </div>

    <!-- フッター -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { images } from '~/config/images'
import { amenityCategories, type Amenity } from '~/config/amenities'
import { type Photo, type PhotoCategory } from '~/config/photos'
import {
  WifiIcon,
  TruckIcon,
  SunIcon,
  FireIcon,
  BeakerIcon,
  CubeIcon,
  Square3Stack3DIcon,
  ShoppingBagIcon,
  HomeIcon,
  HomeModernIcon,
  DocumentIcon,
  BoltIcon,
  ArrowsUpDownIcon,
  RectangleStackIcon,
  TvIcon,
  BookOpenIcon,
  SparklesIcon,
  PhotoIcon,
  BellAlertIcon,
  ShieldCheckIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  ScissorsIcon,
  FolderIcon,
  CircleStackIcon
} from '@heroicons/vue/24/outline'

const { getAvailableAmenities: fetchAvailableAmenities } = useAmenities()
const { getVisiblePhotos } = usePhotos()
const { getApprovedReviews, getAverageRating } = useReviews()
const { user } = useAuth()

// レビュー管理
const approvedReviews = ref<any[]>([])
const averageRating = ref(0)

// 施設設定（知っておきたいこと用）
const facilitySettings = ref({
  checkInTime: '15:00',
  checkOutTime: '11:00',
  houseRules: '',
  maxGuests: 6
})

// 施設設定を読み込み
const loadFacilitySettings = async () => {
  try {
    const response = await fetch('/api/public/settings')
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.settings) {
        facilitySettings.value = data.settings
      }
    }
  } catch (error) {
    console.error('施設設定の取得に失敗:', error)
  }
}

// レビューデータを読み込み
const loadReviews = async () => {
  try {
    approvedReviews.value = await getApprovedReviews()
    averageRating.value = await getAverageRating()
  } catch (error) {
    console.error('レビューの取得に失敗:', error)
  }
}

// 日付をフォーマット
const formatReviewDate = (timestamp: any): string => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

// アイコンマッピング
const iconComponents: Record<string, any> = {
  // 基本設備
  wifi: WifiIcon,
  truck: TruckIcon,
  sun: SunIcon,
  fire: FireIcon,
  bolt: BoltIcon,

  // キッチン・調理
  beaker: BeakerIcon,
  cube: CubeIcon, // 冷蔵庫
  'square-3-stack-3d': Square3Stack3DIcon, // 電子レンジ
  cup: BeakerIcon, // コーヒーメーカー
  'shopping-bag': ShoppingBagIcon, // 食器
  'wrench-screwdriver': WrenchScrewdriverIcon, // キッチンツール
  'circle-stack': CircleStackIcon, // 食器とカトラリー

  // バスルーム
  home: HomeIcon, // 浴室
  'arrow-path': ArrowPathIcon, // 洗濯機・乾燥機
  scissors: ScissorsIcon, // ヘアドライヤー（代替）

  // 寝室・リネン
  'home-modern': HomeModernIcon,
  document: DocumentIcon, // タオル
  'arrows-up-down': ArrowsUpDownIcon, // ハンガー
  'rectangle-stack': RectangleStackIcon, // 遮光カーテン・シーツ
  folder: FolderIcon, // バスタオル（代替）

  // エンターテインメント
  tv: TvIcon,
  'book-open': BookOpenIcon,

  // 屋外・景観
  sparkles: SparklesIcon,
  photo: PhotoIcon,

  // 安全設備
  'bell-alert': BellAlertIcon,
  'shield-check': ShieldCheckIcon,
  heart: HeartIcon
}

const getIconComponent = (iconName: string) => {
  return iconComponents[iconName] || BeakerIcon
}

// アメニティ管理
const showAllAmenities = ref(false)
const availableAmenities = ref<Amenity[]>([])
const displayedAmenities = computed(() => availableAmenities.value.slice(0, 6)) // 最初の6つのみ表示

// カテゴリ別にグループ化
const amenitiesByCategory = computed(() => {
  const grouped: Record<string, Amenity[]> = {}
  availableAmenities.value.forEach(amenity => {
    if (!grouped[amenity.category]) {
      grouped[amenity.category] = []
    }
    grouped[amenity.category].push(amenity)
  })
  return grouped
})

// アメニティデータを読み込み
const loadAmenities = async () => {
  try {
    availableAmenities.value = await fetchAvailableAmenities()
  } catch (error) {
    console.error('アメニティの取得に失敗:', error)
  }
}

// マウント時にアメニティ、写真、レビュー、施設設定を読み込み
onMounted(() => {
  loadAmenities()
  loadPhotos()
  loadReviews()
  loadBlockedDates()
  loadFacilitySettings()
})

// 写真ギャラリー管理
const allPhotos = ref<Photo[]>([])
const showPhotoTour = ref(false)

// Firebaseから写真を読み込み
const loadPhotos = async () => {
  try {
    allPhotos.value = await getVisiblePhotos()
  } catch (error) {
    console.error('写真の取得に失敗:', error)
  }
}

// フォールバック用のローカル写真データ
const fallbackPhotos = computed((): Photo[] => {
  return images.gallery.map((img, index) => ({
    id: `fallback-${index}`,
    url: img.src,
    title: img.alt,
    description: '',
    category: 'exterior' as PhotoCategory,
    isVisible: true,
    order: index
  }))
})

// 表示用の写真リスト（orderでソート）
const displayPhotos = computed(() => {
  const photos = allPhotos.value.length > 0 ? [...allPhotos.value] : fallbackPhotos.value
  return photos.sort((a, b) => a.order - b.order)
})

// 写真ツアーを開く
const openPhotoTour = () => {
  showPhotoTour.value = true
  document.body.style.overflow = 'hidden'
}

// 写真ツアーを閉じる
const closePhotoTour = () => {
  showPhotoTour.value = false
  document.body.style.overflow = 'auto'
}

// ページを共有
const sharePhoto = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: '家具の家 No.1',
        text: '世界的建築家・坂茂が設計した「家具の家 No.1」',
        url: window.location.href
      })
    } catch (error) {
      console.log('Share cancelled or failed:', error)
    }
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('URLをコピーしました')
  }
}

// 予約ページへ遷移
const goToBooking = () => {
  navigateTo('/booking')
}

// 予約フォームの状態管理
const checkInDate = ref('')
const checkOutDate = ref('')
const adults = ref(1)
const children = ref(0)
const infants = ref(0)
const showGuestPicker = ref(false)
const showCalendar = ref(false)

// ブロック期間管理
const { blockedDates, loadBlockedDates, isDateBlocked, isDateRangeBlocked } = useBlockedDates()

// カレンダー表示用の月
const currentMonth = ref(new Date())

// 日付フォーマット
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 月名表示
const currentMonthName = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth() + 1
  return `${year}年${month}月`
})

const nextMonthName = computed(() => {
  const next = new Date(currentMonth.value)
  next.setMonth(next.getMonth() + 1)
  const year = next.getFullYear()
  const month = next.getMonth() + 1
  return `${year}年${month}月`
})

// カレンダーの日付データ生成
const generateMonthDates = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  const dates = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 空白セルを追加
  for (let i = 0; i < startDayOfWeek; i++) {
    dates.push({ day: '', disabled: true, isEmpty: true, key: `empty-${i}` })
  }

  // 日付セルを追加
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    const isPast = date < today
    const isSelected = dateStr === checkInDate.value || dateStr === checkOutDate.value

    // 範囲内判定
    let isInRange = false
    if (checkInDate.value && checkOutDate.value) {
      const checkIn = new Date(checkInDate.value)
      const checkOut = new Date(checkOutDate.value)
      isInRange = date > checkIn && date < checkOut
    }

    dates.push({
      day,
      date: dateStr,
      disabled: isPast,
      isSelected,
      isInRange,
      isEmpty: false,
      key: dateStr
    })
  }

  return dates
}

const currentMonthDates = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  return generateMonthDates(year, month)
})

const nextMonthDates = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth() + 1
  return generateMonthDates(year, month)
})

// 日付選択
const selectDate = (dateObj: any) => {
  if (dateObj.disabled || dateObj.isEmpty) return

  // ブロックされた日付かチェック
  const selectedDate = new Date(dateObj.date)
  if (isDateBlocked(selectedDate)) {
    alert('この日付は予約できません（ブロック期間）')
    return
  }

  if (!checkInDate.value || (checkInDate.value && checkOutDate.value)) {
    // チェックイン日を設定（または両方リセットして新規設定）
    checkInDate.value = dateObj.date
    checkOutDate.value = ''
  } else {
    // チェックアウト日を設定
    if (new Date(dateObj.date) > new Date(checkInDate.value)) {
      checkOutDate.value = dateObj.date

      // チェックイン〜チェックアウトの期間がブロックされていないかチェック
      const checkIn = new Date(checkInDate.value)
      const checkOut = new Date(dateObj.date)
      if (isDateRangeBlocked(checkIn, checkOut)) {
        alert('選択された期間には予約できない日が含まれています')
        checkOutDate.value = ''
        return
      }
    } else {
      // チェックインより前の日付を選んだ場合は入れ替え
      checkOutDate.value = checkInDate.value
      checkInDate.value = dateObj.date

      // チェックイン〜チェックアウトの期間がブロックされていないかチェック
      const checkIn = new Date(dateObj.date)
      const checkOut = new Date(checkOutDate.value)
      if (isDateRangeBlocked(checkIn, checkOut)) {
        alert('選択された期間には予約できない日が含まれています')
        checkInDate.value = ''
        checkOutDate.value = ''
        return
      }
    }
  }
}

// 月移動
const previousMonth = () => {
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() - 1)
  currentMonth.value = newMonth
}

const nextMonth = () => {
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() + 1)
  currentMonth.value = newMonth
}

// 日付クリア
const clearDates = () => {
  checkInDate.value = ''
  checkOutDate.value = ''
}

// 合計ゲスト数
const totalGuests = computed(() => adults.value + children.value + infants.value)

// 宿泊日数を計算
const nights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 0

  const checkIn = new Date(checkInDate.value)
  const checkOut = new Date(checkOutDate.value)
  const diffTime = checkOut.getTime() - checkIn.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
})

// 料金計算
const pricePerNight = 30000
const cleaningFee = 5000

const totalPrice = computed(() => {
  if (nights.value === 0) return 0
  return pricePerNight * nights.value + cleaningFee
})

// 予約処理
const handleReservation = () => {
  if (!checkInDate.value || !checkOutDate.value) {
    alert('チェックイン日とチェックアウト日を選択してください。')
    return
  }

  if (nights.value === 0) {
    alert('有効な日付を選択してください。')
    return
  }

  if (totalGuests.value === 0) {
    alert('宿泊人数を選択してください。')
    return
  }

  if (totalGuests.value > 6) {
    alert('最大6名までご利用いただけます。')
    return
  }

  // ブロック期間の最終チェック
  const checkIn = new Date(checkInDate.value)
  const checkOut = new Date(checkOutDate.value)
  if (isDateRangeBlocked(checkIn, checkOut)) {
    alert('選択された期間には予約できない日が含まれています。別の日程をお選びください。')
    return
  }

  // 新しい予約フローページに遷移
  navigateTo({
    path: '/booking/request',
    query: {
      checkIn: checkInDate.value,
      checkOut: checkOutDate.value,
      adults: adults.value,
      children: children.value,
      infants: infants.value
    }
  })
}

// SEO設定
useHead({
  title: '家具の家 No.1 | 宿泊予約',
  meta: [
    { name: 'description', content: '世界的建築家・坂茂が設計した「家具の家 No.1」。1日1組限定で、この革新的な建築に宿泊できる貴重な体験をご提供します。山中湖の自然に囲まれた特別な時間をお過ごしください。' },
    { property: 'og:title', content: '家具の家 No.1 | 宿泊予約' },
    { property: 'og:description', content: '坂茂建築の傑作に宿泊。1日1組限定の特別な建築体験。' },
    { property: 'og:image', content: images.ogp },
    { name: 'twitter:card', content: 'summary_large_image' }
  ]
})
</script>

<style scoped>
/* 行数制限 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ホバーエフェクト */
button:hover,
a:hover {
  transition: all 0.3s ease;
}

/* スムーズスクロール */
html {
  scroll-behavior: smooth;
}
</style>
