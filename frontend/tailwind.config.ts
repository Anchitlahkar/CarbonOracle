import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#050A0E',   // Deep space black
          surface: '#0A1628',   // Dark navy
          card: '#0F1F35',      // Card background
        },
        accent: {
          green: '#00FF87',     // Bioluminescent green
          red: '#FF3366',       // Danger red
          amber: '#FFB800',     // Warning amber
          blue: '#00D4FF',      // Data blue
        },
        text: {
          primary: '#E8F4FD',   // Near white
          muted: '#7BA7C4',     // Muted blue-grey
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 135, 0.25)',
        'glow-red': '0 0 20px rgba(255, 51, 102, 0.25)',
        'glow-blue': '0 0 20px rgba(0, 212, 255, 0.25)',
      }
    },
  },
  plugins: [],
} satisfies Config;
