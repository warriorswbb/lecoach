/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-roboto)"],
        mono: ["var(--font-roboto-mono)"],
      },
      animation: {
        "gradient-slow": "gradient 20s linear infinite",
      },
      keyframes: {
        gradient: {
          "0%": { transform: "translate(0%, 0%) rotate(0deg)" },
          "25%": { transform: "translate(10%, -10%) rotate(1deg)" },
          "50%": { transform: "translate(-5%, 5%) rotate(-1deg)" },
          "75%": { transform: "translate(-10%, -5%) rotate(0deg)" },
          "100%": { transform: "translate(0%, 0%) rotate(0deg)" },
        },
      },
    },
  },
  plugins: [],
}; 