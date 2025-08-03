// 테스트를 위한 환경 변수 검증 함수들

export class EnvError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvError'
  }
}

export function validateEnv() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new EnvError(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
  
  // Optional vars warning in development
  if (process.env.NODE_ENV === 'development') {
    const optionalVars = [
      'OPENAI_API_KEY',
      'DATABASE_URL',
      'GITHUB_CLIENT_ID',
      'GOOGLE_CLIENT_ID'
    ]
    
    const missingOptional = optionalVars.filter(varName => !process.env[varName])
    if (missingOptional.length > 0) {
      console.warn(`Missing optional environment variables: ${missingOptional.join(', ')}`)
    }
  }
  
  // Security checks
  if (process.env.NODE_ENV === 'production') {
    // Check for public service key
    if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY) {
      throw new EnvError('Service keys should not have NEXT_PUBLIC_ prefix')
    }
    
    // Check for HTTP in production
    const httpUrls = Object.keys(process.env)
      .filter(key => key.includes('URL'))
      .filter(key => process.env[key]?.startsWith('http://'))
    
    if (httpUrls.length > 0) {
      console.warn(`URLs should use HTTPS in production: ${httpUrls.join(', ')}`)
    }
  }
}

export function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new EnvError(`Environment variable ${key} is not set`)
  }
  return value
}

export function getOptionalEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue
}

export function getClientEnv(key: string): string {
  if (!key.startsWith('NEXT_PUBLIC_')) {
    throw new EnvError(`Client environment variables must start with NEXT_PUBLIC_`)
  }
  return getEnv(key)
}

export function isServerEnv(key: string): boolean {
  return !key.startsWith('NEXT_PUBLIC_')
}

export function maskSecretValue(value: string): string {
  if (value.length < 8) return '***'
  return value.slice(0, 4) + '...' + value.slice(-4)
}

export function logEnvStatus() {
  const publicVars = Object.keys(process.env)
    .filter(key => key.startsWith('NEXT_PUBLIC_'))
    .map(key => ({
      key,
      value: maskSecretValue(process.env[key] || '')
    }))
  
  const serverVars = Object.keys(process.env)
    .filter(key => !key.startsWith('NEXT_PUBLIC_') && key !== 'NODE_ENV')
    .map(key => ({
      key,
      present: !!process.env[key]
    }))
  
  console.log('Environment Status:')
  console.log('Public Variables:', publicVars)
  console.log('Server Variables:', serverVars)
}
