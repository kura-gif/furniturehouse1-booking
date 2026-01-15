import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const token = config.switchbotToken
  const secret = config.switchbotSecret
  const deviceId = config.switchbotDeviceId

  if (!token || !secret || !deviceId) {
    throw createError({
      statusCode: 500,
      message: 'SwitchBot credentials not configured'
    })
  }

  try {
    const timestamp = Date.now().toString()
    const nonce = crypto.randomUUID()
    const stringToSign = `${token}${timestamp}${nonce}`

    const sign = crypto
      .createHmac('sha256', secret)
      .update(stringToSign)
      .digest('base64')

    const response = await $fetch<{
      statusCode: number
      body: {
        temperature: number
        humidity: number
        battery: number
        deviceId: string
        deviceType: string
      }
      message: string
    }>(`https://api.switch-bot.com/v1.1/devices/${deviceId}/status`, {
      headers: {
        'Authorization': token,
        'sign': sign,
        't': timestamp,
        'nonce': nonce,
        'Content-Type': 'application/json'
      }
    })

    if (response.statusCode !== 100) {
      throw new Error(`SwitchBot API error: ${response.message}`)
    }

    return {
      temperature: response.body.temperature,
      humidity: response.body.humidity,
      battery: response.body.battery,
      updatedAt: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('SwitchBot API error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch indoor data'
    })
  }
})
