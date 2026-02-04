/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        petrack: {
          dark: '#14532d',
          DEFAULT: '#166534',
          light: '#22c55e',
          pale: '#f0fdf4',
        },
        orange: {
          DEFAULT: '#EE862B',
          light:  '#DA842E',
        },
      },
    },
  },
  plugins: [],
};
