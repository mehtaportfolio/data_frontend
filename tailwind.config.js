export default {
  content: [
    './index.html',
    './src/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/context/**/*.{js,ts,jsx,tsx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/types/**/*.{js,ts,jsx,tsx}',
    './src/utils/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00f3ff',
          magenta: '#ff00ff',
          yellow: '#fbff00',
        },
      },
      animation: {
        'glow-pulse': 'glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: 0.8, filter: 'brightness(1.5)' },
        },
      },
    },
  },
}