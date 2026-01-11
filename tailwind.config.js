/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#d9e9ff",
          200: "#b9d5ff",
          300: "#8cb7ff",
          400: "#5d91ff",
          500: "#3c74f6",
          600: "#2c5dd4",
          700: "#234bab",
          800: "#1f3e87",
          900: "#1d346d",
        },
      },
    },
  },
  plugins: [],
};
