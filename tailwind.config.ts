/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#090d0a',
        zinc: {
          50: '#fafbfa',
          100: '#f0f3f1',
          200: '#dce3de',
          300: '#c0cbc3',
          400: '#a6b2aa',
          500: '#909d94',
          600: '#78867c',
          700: '#59665d',
          800: '#29352d',
          900: '#171f19',
          950: '#0d130f',
        },
        background: {
          DEFAULT: '#090d0a',
          secondary: '#111713',
          card: '#121914',
          elevated: '#19211c',
        },
        neon: {
          green: '#32d17b',
          'green-dim': '#25b96a',
          'green-glow': 'rgba(50, 209, 123, 0.08)',
          'green-muted': 'rgba(50, 209, 123, 0.1)',
        },
        surface: {
          DEFAULT: '#19211c',
          hover: '#202a23',
          border: '#29352d',
          'border-active': '#32d17b',
        },
        text: {
          primary: '#e7ece8',
          secondary: '#a6b2aa',
          muted: '#89958c',
          neon: '#32d17b',
        },
        status: {
          success: '#32d17b',
          error: '#ff4141',
          warning: '#ffaa00',
          info: '#00aaff',
        },
        difficulty: {
          easy: '#32d17b',
          medium: '#ffaa00',
          hard: '#ff4141',
          insane: '#cc00ff',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        display: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 12px rgba(50, 209, 123, 0.12)',
        'neon-sm': '0 0 8px rgba(50, 209, 123, 0.1)',
        'neon-lg': '0 0 18px rgba(50, 209, 123, 0.16)',
        'card': '0 8px 24px rgba(0, 0, 0, 0.18)',
        'card-hover': '0 10px 28px rgba(0, 0, 0, 0.24)',
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 3s linear infinite',
        'scan-line': 'scan-line 4s linear infinite',
        'type': 'type 2s steps(40, end)',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-up': 'slide-in-up 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'glitch': 'glitch 1s linear infinite',
        'shimmer': 'shimmer 2s infinite alternate',
      },
      keyframes: {
        'shimmer': {
          '0%': { filter: 'drop-shadow(0 0 5px rgba(250, 204, 21, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.8))' },
        },
        'shake': {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-3px, 3px)' },
          '40%': { transform: 'translate(-3px, -3px)' },
          '60%': { transform: 'translate(3px, 3px)' },
          '80%': { transform: 'translate(3px, -3px)' },
          '100%': { transform: 'translate(0)' },
        },
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(50, 209, 123, 0.3)' },
          '50%': { boxShadow: '0 0 16px rgba(50, 209, 123, 0.45)' },
        },
        'flicker': {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.8' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.5' },
          '99%': { opacity: '1' },
        },
        'scan-line': {
          '0%': { top: '-10%' },
          '100%': { top: '110%' },
        },
        'type': {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(50,209,123,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(50,209,123,0.025) 1px, transparent 1px)',
        'gradient-radial-neon': 'radial-gradient(ellipse at center, rgba(50,209,123,0.06) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      }
    },
  },
  plugins: [],
}
