/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#99cdd8',
        secondary: '#e1f5f8',
        accent: '#bfe5ec',
        neutral: '#fffef1',
        dark: '#1f3b42',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
