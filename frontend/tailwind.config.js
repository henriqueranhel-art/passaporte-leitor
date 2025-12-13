/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E67E22',
          light: '#F5A623',
          dark: '#D35400',
        },
        secondary: {
          DEFAULT: '#3498DB',
          light: '#5DADE2',
        },
        success: {
          DEFAULT: '#27AE60',
          light: '#58D68D',
        },
        background: {
          DEFAULT: '#FDF6E3',
          dark: '#F4E9D4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
