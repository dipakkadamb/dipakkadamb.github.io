/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        navy: {
          950: '#04090f',
          900: '#060d17',
          800: '#091424',
          700: '#0d1e35',
          600: '#122848',
          500: '#1a3a62',
          400: '#1e4a80',
        },
        royal: {
          DEFAULT: '#1a56db',
          light:   '#3b7de9',
          dim:     'rgba(26,86,219,0.15)',
          glow:    'rgba(26,86,219,0.35)',
        },
        slate: {
          850: '#0f172a',
        },
        accent: {
          cyan:    '#06b6d4',
          teal:    '#14b8a6',
          amber:   '#f59e0b',
        },
        surface: {
          DEFAULT: '#0d1e35',
          raised:  '#122848',
          high:    '#1a3a62',
        },
        text: {
          primary:  '#f0f4ff',
          secondary:'#94a8cc',
          muted:    '#546380',
        },
      },
      backgroundImage: {
        'hero-gradient':     'radial-gradient(ellipse 80% 60% at 60% 20%, rgba(26,86,219,0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(6,182,212,0.10) 0%, transparent 50%)',
        'card-gradient':     'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'glow-line':         'linear-gradient(90deg, transparent 0%, #1a56db 50%, transparent 100%)',
        'section-separator': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(26,86,219,0.4)' },
          '50%':      { opacity: '0.8', boxShadow: '0 0 40px rgba(26,86,219,0.7)' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
      animation: {
        'float':      'float 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'spin-slow':  'spin-slow 12s linear infinite',
        'shimmer':    'shimmer 3s linear infinite',
        'blink':      'blink 1.2s step-end infinite',
      },
      boxShadow: {
        'card':    '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'royal':   '0 0 40px rgba(26,86,219,0.3)',
        'royal-lg':'0 0 80px rgba(26,86,219,0.2)',
        'hover':   '0 8px 40px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
