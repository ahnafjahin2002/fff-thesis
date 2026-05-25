/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FFF8E7',
          dark: '#F5EDCF',
        },
        bluetint: '#E8F4FD',
        yellowtint: '#FFFDE7',
        textprimary: '#2D1B00',
        accent: {
          primary: '#E06B2E',
          secondary: '#2E8B57',
        },
        phoneme: '#FFD700',
        gentle: '#FFB347',
        gamebg: '#F0FFF4',
        border: '#E2D5C3',
      },
      fontFamily: {
        kalpurush: ['Kalpurush', 'serif'],
        noto: ['"Noto Sans Bengali"', 'sans-serif'],
        atkinson: ['"Atkinson Hyperlegible"', 'sans-serif'],
      },
      transitionDuration: {
        '200': '200ms',
      },
    },
  },
  plugins: [],
}
