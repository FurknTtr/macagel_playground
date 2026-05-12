/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind'in hangi dosyalardaki className'leri okuyacağını buraya yazıyoruz
  content: [
    "./app/**/*.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}