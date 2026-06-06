import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FAF7F0',
          dark: '#EFE9DC',
        },
        cocoa: {
          DEFAULT: '#3D2417',
          light: '#5A3A26',
          dark: '#2A1810',
        },
        cream: {
          DEFAULT: '#F5EBDF',
        },
        moss: {
          DEFAULT: '#7A9E7E',
          dark: '#5D7E62',
          light: '#A3C2A7',
        },
        rust: {
          DEFAULT: '#B8623F',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
