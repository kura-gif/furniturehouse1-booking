export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const apiKey = config.openweatherApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'OpenWeather API key not configured'
    })
  }

  // 山中湖の座標
  const lat = 35.4167
  const lon = 138.8667

  try {
    const response = await $fetch<{
      main: {
        temp: number
        feels_like: number
        humidity: number
      }
      weather: Array<{
        id: number
        main: string
        description: string
        icon: string
      }>
      wind: {
        speed: number
      }
      name: string
    }>('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: 'metric',
        lang: 'ja'
      }
    })

    return {
      temperature: Math.round(response.main.temp * 10) / 10,
      feelsLike: Math.round(response.main.feels_like * 10) / 10,
      humidity: response.main.humidity,
      weather: {
        main: response.weather[0]?.main || '',
        description: response.weather[0]?.description || '',
        icon: response.weather[0]?.icon || ''
      },
      wind: {
        speed: response.wind.speed
      },
      location: '山中湖',
      updatedAt: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('OpenWeather API error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch weather data'
    })
  }
})
