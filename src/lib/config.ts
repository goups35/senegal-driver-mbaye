import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Next.js configuration
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Database configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  
  // AI service configuration
  OPENAI_API_KEY: z.string().min(1).optional(),
  GROQ_API_KEY: z.string().min(1).optional(),
  GOOGLE_GEMINI_API_KEY: z.string().min(1).optional(),
  
  // Email configuration
  RESEND_API_KEY: z.string().min(1).optional(),
  
  // Communication
  WHATSAPP_PHONE_NUMBER: z.string().min(1).optional(),
  
  // Security configuration
  JWT_SECRET: z.string().min(32).optional(),
  API_RATE_LIMIT: z.number().int().positive().default(100),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  VERCEL_ANALYTICS_ID: z.string().optional(),
})

type Config = z.infer<typeof envSchema>

// Validate and parse environment variables
function validateEnv(): Config {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    WHATSAPP_PHONE_NUMBER: process.env.WHATSAPP_PHONE_NUMBER,
    JWT_SECRET: process.env.JWT_SECRET,
    API_RATE_LIMIT: process.env.API_RATE_LIMIT ? parseInt(process.env.API_RATE_LIMIT) : undefined,
    SENTRY_DSN: process.env.SENTRY_DSN,
    VERCEL_ANALYTICS_ID: process.env.VERCEL_ANALYTICS_ID,
  }

  try {
    return envSchema.parse(env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter(err => err.code === 'invalid_type' && err.received === 'undefined')
        .map(err => err.path.join('.'))
      
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
        `Please check your .env.local file and ensure all required variables are set.`
      )
    }
    throw error
  }
}

// Export validated configuration
export const config = validateEnv()

// Environment-specific configurations
export const isProduction = config.NODE_ENV === 'production'
export const isDevelopment = config.NODE_ENV === 'development'
export const isTest = config.NODE_ENV === 'test'

// Database configuration
export const database = {
  url: config.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY,
} as const

// AI service configuration
export const ai = {
  openai: {
    apiKey: config.OPENAI_API_KEY,
    model: 'gpt-4-turbo-preview',
    maxTokens: 4000,
  },
  groq: {
    apiKey: config.GROQ_API_KEY,
    model: 'llama3-70b-8192',
  },
  gemini: {
    apiKey: config.GOOGLE_GEMINI_API_KEY,
    model: 'gemini-pro',
  },
} as const

// Security configuration
export const security = {
  jwtSecret: config.JWT_SECRET || 'fallback-secret-for-dev',
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.API_RATE_LIMIT,
  },
  cors: {
    origin: isProduction 
      ? [config.NEXT_PUBLIC_APP_URL]
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    credentials: true,
  },
} as const

// API configuration
export const api = {
  baseUrl: config.NEXT_PUBLIC_APP_URL,
  version: 'v1',
  timeout: 30000, // 30 seconds
} as const

// Feature flags
export const features = {
  enableEmailQuotes: !!config.RESEND_API_KEY,
  enableWhatsAppIntegration: !!config.WHATSAPP_PHONE_NUMBER,
  enableAIExpert: !!(config.OPENAI_API_KEY || config.GROQ_API_KEY || config.GOOGLE_GEMINI_API_KEY),
  enableSentry: !!config.SENTRY_DSN,
} as const