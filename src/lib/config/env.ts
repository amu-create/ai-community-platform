/**
 * Environment variable validation and management
 */

type EnvVar = {
  key: string;
  required: boolean;
  description: string;
  example?: string;
};

const ENV_VARS: EnvVar[] = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    example: 'https://your-project.supabase.co'
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous/public key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  {
    key: 'SUPABASE_SERVICE_KEY',
    required: true,
    description: 'Supabase service role key (server-side only)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  {
    key: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key for AI features',
    example: 'sk-...'
  },
  {
    key: 'NEXT_PUBLIC_APP_URL',
    required: true,
    description: 'Application URL',
    example: 'http://localhost:8080'
  }
];

export class EnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvError';
  }
}

/**
 * Validates that all required environment variables are set
 * @throws {EnvError} If required environment variables are missing
 */
export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  ENV_VARS.forEach(({ key, required, description }) => {
    const value = process.env[key];
    
    if (required && !value) {
      missing.push(`${key} - ${description}`);
    } else if (!required && !value) {
      warnings.push(`${key} - ${description} (optional)`);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(m => console.error(`   - ${m}`));
    throw new EnvError(
      `Missing required environment variables: ${missing.map(m => m.split(' - ')[0]).join(', ')}`
    );
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Missing optional environment variables:');
    warnings.forEach(w => console.warn(`   - ${w}`));
  }

  // Additional security checks
  if (process.env.NODE_ENV === 'production') {
    // Ensure service key is not exposed to client
    if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY) {
      throw new EnvError('SUPABASE_SERVICE_KEY should not have NEXT_PUBLIC_ prefix!');
    }

    // Ensure APP_URL is using HTTPS in production
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl && !appUrl.startsWith('https://')) {
      console.warn('⚠️  NEXT_PUBLIC_APP_URL should use HTTPS in production');
    }
  }

  console.log('✅ Environment variables validated successfully');
}

/**
 * Get environment variable value with type safety
 */
export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new EnvError(`Environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get optional environment variable
 */
export function getOptionalEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

/**
 * Environment configuration object
 */
export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceKey: process.env.SUPABASE_SERVICE_KEY!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL!,
    env: process.env.NODE_ENV,
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
  },
} as const;

/**
 * Generate .env.example file content
 */
export function generateEnvExample(): string {
  const lines = ['# AI Community Platform Environment Variables', ''];
  
  ENV_VARS.forEach(({ key, description, example, required }) => {
    lines.push(`# ${description}${required ? ' (Required)' : ' (Optional)'}`);
    lines.push(`${key}=${example || ''}`);
    lines.push('');
  });

  return lines.join('\n');
}
