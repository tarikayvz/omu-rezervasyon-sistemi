/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        omu: {
          red: '#E30613',
          dark: '#333333',
          gray: '#F4F4F4',
          blue: '#005F87'
        }
      },
    },
  },
  plugins: [],
}