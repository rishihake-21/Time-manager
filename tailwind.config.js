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
        study: {
          DEFAULT: "#1B7A4A",
          soft: "#E1F3E7",
        },
        project: {
          DEFAULT: "#A04A1E",
          soft: "#F5E6DD",
        },
        personal: {
          DEFAULT: "#8A6D1E",
          soft: "#F3ECD8",
        },
        exercise: {
          DEFAULT: "#C0392B",
          soft: "#FADBD8",
        },
        other: {
          DEFAULT: "#5D6D7E",
          soft: "#EBF5FB",
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