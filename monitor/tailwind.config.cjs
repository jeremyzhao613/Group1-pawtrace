const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.join(__dirname, 'index.html')],
  theme: {
    extend: {},
  },
  plugins: [],
};
