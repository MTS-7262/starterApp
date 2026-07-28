import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#0a0a0d', // app background
          1: '#101013', // header / rail background
          2: '#17171b', // card surface
          3: '#1d1d22', // hover / elevated surface
          4: '#26262c' // active / pressed
        },
        stroke: {
          DEFAULT: '#232328',
          soft: '#1a1a1f',
          strong: '#34343c'
        },
        ink: {
          primary: '#f4f4f6',
          secondary: '#a6a6b0',
          muted: '#68686f',
          faint: '#48484e'
        },
        brand: {
          DEFAULT: '#7c6cf0',
          dim: '#5f4fd1',
          bright: '#9484ff',
          soft: 'rgba(124,108,240,0.12)',
          soft2: 'rgba(124,108,240,0.22)'
        },
        related: {
          DEFAULT: '#28c9a8',
          dim: '#1ea88a',
          soft: 'rgba(40,201,168,0.12)'
        },
        good: {
          DEFAULT: '#3ecf8e',
          soft: 'rgba(62,207,142,0.12)'
        },
        warn: {
          DEFAULT: '#f0b13d',
          soft: 'rgba(240,177,61,0.12)'
        },
        danger: {
          DEFAULT: '#f0546b',
          dim: '#c73f53',
          soft: 'rgba(240,84,107,0.12)'
        }
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)']
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 10px 30px -12px rgba(0,0,0,0.6)',
        panel: '0 1px 0 rgba(255,255,255,0.02) inset, 0 24px 60px -20px rgba(0,0,0,0.7)',
        glow: '0 0 0 1px rgba(124,108,240,0.4), 0 0 24px -4px rgba(124,108,240,0.5)',
        popover: '0 20px 50px -12px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)'
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
        'radial-fade': 'radial-gradient(120% 120% at 50% -10%, rgba(124,108,240,0.16), transparent 60%)'
      }
    }
  },
  plugins: []
};

export default config;
