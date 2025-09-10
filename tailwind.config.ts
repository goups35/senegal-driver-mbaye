import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Couleurs Sénégal - version simplifiée
      colors: {
        'senegal-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#00a651',
          600: '#008a45',
          700: '#00713a',
          800: '#005c30',
          900: '#004a27',
          DEFAULT: '#00a651',
        },
        'senegal-yellow': {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#ffed00',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          DEFAULT: '#ffed00',
        },
        'senegal-red': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#e31e24',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          DEFAULT: '#e31e24',
        },
        'sahel-sand': {
          50: '#fefdfb',
          100: '#fdf9f0',
          200: '#fbf2e0',
          300: '#f8e8c5',
          400: '#f4e4bc',
          500: '#e6d09a',
          600: '#d4b975',
          700: '#b8965d',
          800: '#947649',
          900: '#76603b',
          DEFAULT: '#f4e4bc',
        },
        'baobab-brown': {
          50: '#faf8f5',
          100: '#f2ebe1',
          200: '#e3d1bf',
          300: '#d0b094',
          400: '#b8966d',
          500: '#8b4513',
          600: '#7d3e11',
          700: '#683210',
          800: '#542a0f',
          900: '#44230e',
          DEFAULT: '#8b4513',
        },
        'ocean-blue': {
          50: '#eff8ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#0077be',
          600: '#0066a3',
          700: '#005588',
          800: '#00446d',
          900: '#003852',
          DEFAULT: '#0077be',
        },
        'teranga-orange': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff8c00',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          DEFAULT: '#ff8c00',
        },
        
        // Compatibilité Next.js
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },

      // Typographie simplifiée
      fontFamily: {
        primary: ['Inter', 'system-ui', 'sans-serif'],
        secondary: ['Poppins', 'system-ui', 'sans-serif'],
        accent: ['Merriweather', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // Tailles personnalisées
      height: {
        '18': '4.5rem',
      },

      // Animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-from-top': 'slideInFromTop 0.2s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromTop: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      // Gradients
      backgroundImage: {
        'senegal-gradient': 'linear-gradient(135deg, #00a651, #0077be)',
        'sahel-gradient': 'linear-gradient(45deg, #f4e4bc, #ffed00)',
        'teranga-gradient': 'linear-gradient(135deg, #ff8c00, #e31e24)',
        'hero-gradient': 'linear-gradient(135deg, #00a651 0%, #0077be 50%, #ff8c00 100%)',
      },
    },
  },
  plugins: [],
};

export default config;