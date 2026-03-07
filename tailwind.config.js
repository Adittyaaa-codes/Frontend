/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0D0D0F',
        surface: '#141417',
        subtle: '#222226',
        accent: '#6366F1',
        'accent-hover': '#4F46E5',
        primary: '#F3F4F6',
        muted: '#A1A1AA',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
