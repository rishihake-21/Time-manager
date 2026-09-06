/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#0F1B33",
        surface: "#16234A",
        surfaceRaised: "#1C2C57",
        ink: "#F3F5FA",
        inkfaint: "#9AA7CC",
        line: "#2B3B6B",
        college: {
          DEFAULT: "#2E6BFF",
          soft: "#1B2C63",
        },
        personal: {
          DEFAULT: "#EE1D25",
          soft: "#4A1620",
        },
        danger: "#FF5B5B",
        webgold: "#FFD447",
      },
      fontFamily: {
        display: ["'Bangers'", "system-ui", "sans-serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        webglow:
          "radial-gradient(circle at 50% 0%, rgba(46,107,255,0.18), transparent 60%)",
      },
    },
  },
  plugins: [],
};
