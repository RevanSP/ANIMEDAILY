/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx}"],
  plugins: [require("daisyui")],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        orange: "#F47521",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["black", "lofi"],
  },
};