/**
 * Color Palette - Senegal Transport
 * Palette de couleurs étendue basée sur les couleurs du Sénégal
 */

export const colorPalette = {
  // Couleurs primaires Sénégal
  senegal: {
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#00a651', // Couleur principale
      600: '#008a45',
      700: '#00713a',
      800: '#005c30',
      900: '#004a27',
    },
    yellow: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#ffed00', // Couleur principale
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#e31e24', // Couleur principale
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    }
  },

  // Couleurs naturelles Sénégal
  nature: {
    'sahel-sand': {
      50: '#fefdfb',
      100: '#fdf9f0',
      200: '#fbf2e0',
      300: '#f8e8c5',
      400: '#f4e4bc', // Couleur principale
      500: '#e6d09a',
      600: '#d4b975',
      700: '#b8965d',
      800: '#947649',
      900: '#76603b',
    },
    'baobab-brown': {
      50: '#faf8f5',
      100: '#f2ebe1',
      200: '#e3d1bf',
      300: '#d0b094',
      400: '#b8966d',
      500: '#8b4513', // Couleur principale
      600: '#7d3e11',
      700: '#683210',
      800: '#542a0f',
      900: '#44230e',
    },
    'ocean-blue': {
      50: '#eff8ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#0077be', // Couleur principale
      600: '#0066a3',
      700: '#005588',
      800: '#00446d',
      900: '#003852',
    },
    'teranga-orange': {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#ff8c00', // Couleur principale
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    }
  },

  // Couleurs sémantiques
  semantic: {
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    }
  },

  // Couleurs neutres
  neutral: {
    white: '#ffffff',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    black: '#000000',
  }
} as const

// Couleurs avec transparence
export const colorWithOpacity = {
  'senegal-green-10': 'rgba(0, 166, 81, 0.1)',
  'senegal-green-20': 'rgba(0, 166, 81, 0.2)',
  'senegal-green-50': 'rgba(0, 166, 81, 0.5)',
  'ocean-blue-10': 'rgba(0, 119, 190, 0.1)',
  'ocean-blue-20': 'rgba(0, 119, 190, 0.2)',
  'sahel-sand-10': 'rgba(244, 228, 188, 0.1)',
  'sahel-sand-20': 'rgba(244, 228, 188, 0.2)',
} as const