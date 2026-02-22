/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0D1117',
        card: '#161B22',
        profit: '#00C805',
        loss: '#FF3B30',
        border: '#30363D',
      },
    },
  },
  plugins: [],
}
