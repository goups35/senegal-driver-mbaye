/**
 * Environment Variables Validation
 * Validates required environment variables at runtime
 */

interface EnvConfig {
  // Supabase (Required)
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  
  // AI APIs (At least one required)
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  
  // Optional
  RESEND_API_KEY?: string;
  WHATSAPP_PHONE_NUMBER?: string;
  NEXT_PUBLIC_APP_URL?: string;
}

export function validateEnvironmentVariables(): EnvConfig {
  const env = process.env;
  
  // Required variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missingRequired = requiredVars.filter(key => !env[key]);
  
  if (missingRequired.length > 0) {
    throw new Error(
      'Missing required environment variables: ' + missingRequired.join(', ') + '\n' +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }
  
  // Check for at least one AI API key
  const aiKeys = ['OPENAI_API_KEY', 'GEMINI_API_KEY', 'GROQ_API_KEY'];
  const hasAiKey = aiKeys.some(key => env[key] && env[key] !== 'your_new_openai_api_key_here' && env[key] !== 'your_new_gemini_api_key_here' && env[key] !== 'your_new_groq_api_key_here');
  
  if (!hasAiKey) {
    console.warn('Warning: No AI API keys configured. Some features may not work.');
  }
  
  // Validate key formats
  if (env.OPENAI_API_KEY && !env.OPENAI_API_KEY.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format. Keys should start with "sk-"');
  }
  
  if (env.GROQ_API_KEY && !env.GROQ_API_KEY.startsWith('gsk_')) {
    throw new Error('Invalid GROQ API key format. Keys should start with "gsk_"');
  }
  
  if (env.GEMINI_API_KEY && !env.GEMINI_API_KEY.startsWith('AIza')) {
    throw new Error('Invalid Google Gemini API key format. Keys should start with "AIza"');
  }
  
  return {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    OPENAI_API_KEY: env.OPENAI_API_KEY,
    GEMINI_API_KEY: env.GEMINI_API_KEY,
    GROQ_API_KEY: env.GROQ_API_KEY,
    RESEND_API_KEY: env.RESEND_API_KEY,
    WHATSAPP_PHONE_NUMBER: env.WHATSAPP_PHONE_NUMBER,
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  };
}

// Validate on module load in development
if (process.env.NODE_ENV === 'development') {
  try {
    validateEnvironmentVariables();
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
  }
}
