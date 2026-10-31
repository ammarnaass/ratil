import {
  TAILWIND_COLOR_TOKENS,
  TAILWIND_FONT_FAMILIES,
} from './features/theme/tokens/tailwind-bindings.ts';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: TAILWIND_COLOR_TOKENS,
      fontFamily: TAILWIND_FONT_FAMILIES,
      spacing: {
        gutter: '1.5rem',
        margin: '3rem',
      },
    },
  },
  plugins: [],
};
