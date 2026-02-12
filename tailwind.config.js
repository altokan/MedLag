/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent-color)',
      },
      fontFamily: {
        'ui': ['Inter', 'sans-serif'],
        'modern': ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-rotate': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}