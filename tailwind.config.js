/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'senegal-green': '#00a651',
        'teranga-orange': '#ff8c00',
        'ocean-blue': '#0066cc',
        'baobab-brown': '#8b4513',
        'sahel-sand': '#f5deb3',
      },
    },
  },
  plugins: [],
}