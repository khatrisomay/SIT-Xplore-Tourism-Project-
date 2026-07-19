/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8ef",
          100: "#fbf0d8",
          200: "#f6ddaf",
          300: "#f0c47d",
          400: "#e9a552",
          500: "#e38a32",
          600: "#d37227",
          700: "#af5721",
          800: "#8c441f",
          900: "#70381c",
          950: "#3d1b0d",
        },
        dark: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d0d0d0",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#3d3d3d",
          950: "#0b0c10", // premium deep dark
        },
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
      },
    },
  },
  plugins: [],
};
