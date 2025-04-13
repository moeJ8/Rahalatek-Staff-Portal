/** @type {import('tailwindcss').Config} */
import flowbite from "flowbite-react/tailwind";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}", 
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [flowbite.plugin()], 
};
