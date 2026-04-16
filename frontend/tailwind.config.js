/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cloudWhite: '#F8FAFC',    /* Light Slate for main background */
        deepNavy: '#0F172A',      /* Charcoal for high readability text */
        aviationBlue: '#0284C7',  /* Primary accent for buttons/active states */
        glassBorder: 'rgba(255, 255, 255, 0.4)',
      }
    },
  },
  plugins: [],
}
