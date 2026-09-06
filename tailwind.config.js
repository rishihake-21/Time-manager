/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#EEF1EF",
        surface: "#FFFFFF",
        ink: "#1E2A26",
        inkfaint: "#5B665F",
        line: "#C7CCC4",
        college: {
          DEFAULT: "#2F5D8A",
          soft: "#E4ECF4",
        },
        personal: {
          DEFAULT: "#8A6D1E",
          soft: "#F3ECD8",
        },
        danger: "#A3372E",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
