export default defineEventHandler((event) => {
  // Basic認証が無効の場合はスキップ
  if (process.env.BASIC_AUTH_ENABLED !== 'true') {
    return
  }

  // API・静的ファイルはスキップ
  const path = event.path || ''
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_nuxt/') ||
    path.startsWith('/favicon') ||
    path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)
  ) {
    return
  }

  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    setResponseStatus(event, 401)
    setHeader(event, 'WWW-Authenticate', 'Basic realm="Protected"')
    return 'Unauthorized'
  }

  const base64Credentials = authHeader.split(' ')[1]
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
  const [username, password] = credentials.split(':')

  const validUser = process.env.BASIC_AUTH_USER || 'admin'
  const validPass = process.env.BASIC_AUTH_PASSWORD || ''

  if (!validPass) {
    console.error('BASIC_AUTH_PASSWORD is not set')
    setResponseStatus(event, 500)
    return 'Server configuration error'
  }

  if (username !== validUser || password !== validPass) {
    setResponseStatus(event, 401)
    setHeader(event, 'WWW-Authenticate', 'Basic realm="Protected"')
    return 'Unauthorized'
  }
})
