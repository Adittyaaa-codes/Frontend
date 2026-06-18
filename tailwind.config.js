/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base:           '#08080B',
        surface:        '#111116',
        'surface-2':    '#18181F',
        subtle:         '#26262F',
        'subtle-2':     '#303040',
        accent:         '#7C3AED',
        'accent-light': '#A78BFA',
        'accent-hover': '#6D28D9',
        'accent-glow':  'rgba(124,58,237,0.25)',
        primary:        '#F1F0FF',
        muted:          '#8B8BA7',
        'muted-2':      '#5F5F78',
        success:        '#10B981',
        warning:        '#F59E0B',
        danger:         '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'mesh-purple':      'radial-gradient(at 40% 20%, rgba(124,58,237,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(99,102,241,0.08) 0px, transparent 40%)',
      },
      boxShadow: {
        'glow-sm':   '0 0 12px rgba(124,58,237,0.35)',
        'glow-md':   '0 0 24px rgba(124,58,237,0.25)',
        'glow-lg':   '0 0 48px rgba(124,58,237,0.15)',
        'card':      '0 4px 24px rgba(0,0,0,0.5)',
        'card-hover':'0 8px 40px rgba(0,0,0,0.7)',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
