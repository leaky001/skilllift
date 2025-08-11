/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lavender: "#B093EF",
        indigoLavender: "#A340E0",
        magnolia: "#FBF0FF",
        violet: "#631499",
        deepViolet: "rgb(60, 9, 100)",
        eerieBlack: "rgb(31, 31, 31)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 14px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
