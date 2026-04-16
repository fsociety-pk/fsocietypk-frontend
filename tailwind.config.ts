/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand palette
        background: {
          DEFAULT: '#0a0a0a',
          secondary: '#111111',
          card: '#141414',
          elevated: '#1a1a1a',
        },
        neon: {
          green: '#00ff41',
          'green-dim': '#00cc33',
          'green-glow': 'rgba(0, 255, 65, 0.15)',
          'green-muted': '#00ff4133',
        },
        surface: {
          DEFAULT: '#1e1e1e',
          hover: '#252525',
          border: '#2a2a2a',
          'border-active': '#00ff41',
        },
        text: {
          primary: '#e8e8e8',
          secondary: '#a0a0a0',
          muted: '#555555',
          neon: '#00ff41',
        },
        status: {
          success: '#00ff41',
          error: '#ff4141',
          warning: '#ffaa00',
          info: '#00aaff',
        },
        difficulty: {
          easy: '#00ff41',
          medium: '#ffaa00',
          hard: '#ff4141',
          insane: '#cc00ff',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Orbitron"', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 255, 65, 0.5), 0 0 20px rgba(0, 255, 65, 0.2)',
        'neon-sm': '0 0 5px rgba(0, 255, 65, 0.4)',
        'neon-lg': '0 0 20px rgba(0, 255, 65, 0.6), 0 0 40px rgba(0, 255, 65, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.6)',
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
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 255, 65, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 65, 0.8), 0 0 40px rgba(0, 255, 65, 0.4)' },
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
        'grid-pattern': 'linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)',
        'gradient-radial-neon': 'radial-gradient(ellipse at center, rgba(0,255,65,0.1) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      }
    },
  },
  plugins: [],
}
