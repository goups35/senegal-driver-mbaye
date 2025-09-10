/**
 * Typography System - Senegal Transport
 * Système de typographie optimisé pour le web et mobile
 */

export const typography = {
  // Font Families
  fonts: {
    primary: ['Inter', 'system-ui', 'sans-serif'],
    secondary: ['Poppins', 'system-ui', 'sans-serif'],
    accent: ['Merriweather', 'serif'],
    mono: ['JetBrains Mono', 'monospace']
  },

  // Font Sizes (rem values)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },

  // Line Heights
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },

  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  }
} as const

// Typography Utility Classes
export const typographyClasses = {
  // Headings
  h1: 'text-4xl md:text-5xl font-bold leading-tight text-baobab-brown',
  h2: 'text-3xl md:text-4xl font-bold leading-tight text-baobab-brown',
  h3: 'text-2xl md:text-3xl font-semibold leading-normal text-baobab-brown',
  h4: 'text-xl md:text-2xl font-semibold leading-normal text-baobab-brown',
  h5: 'text-lg md:text-xl font-medium leading-normal text-baobab-brown',
  h6: 'text-base md:text-lg font-medium leading-normal text-baobab-brown',
  
  // Body Text
  body: 'text-base leading-relaxed text-gray-700',
  bodyLarge: 'text-lg leading-relaxed text-gray-700',
  bodySmall: 'text-sm leading-normal text-gray-600',
  
  // UI Text
  caption: 'text-xs leading-normal text-gray-500',
  label: 'text-sm font-medium leading-normal text-gray-700',
  button: 'text-sm font-semibold leading-none',
  
  // Accent Text
  accent: 'font-accent text-teranga-orange font-medium',
  brand: 'font-secondary font-bold bg-gradient-to-r from-senegal-green via-ocean-blue to-teranga-orange bg-clip-text text-transparent',
  
  // Special
  hero: 'text-5xl md:text-6xl font-extrabold leading-none text-baobab-brown',
  subtitle: 'text-xl md:text-2xl leading-relaxed text-gray-600',
} as const