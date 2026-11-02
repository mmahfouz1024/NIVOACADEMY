import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef3ff",
          100: "#d9e4ff",
          200: "#b6c9fb",
          300: "#86a3f3",
          400: "#4f74e3",
          500: "#2a4fc4",
          600: "#17389c",
          700: "#0f2a7a",
          800: "#0A2A6B",
          900: "#071d4d",
          950: "#040f2b",
        },
        gold: {
          50: "#fff9e6",
          100: "#fff0bf",
          200: "#ffe285",
          300: "#f6cd4a",
          400: "#e8b72a",
          500: "#D4A017",
          600: "#b07d0e",
          700: "#8a5c0f",
          800: "#6f4813",
          900: "#5c3b14",
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg,#f6cd4a 0%,#D4A017 45%,#b07d0e 100%)",
        "navy-gradient": "linear-gradient(135deg,#0f2a7a 0%,#0A2A6B 50%,#040f2b 100%)",
      },
      boxShadow: {
        glow: "0 10px 40px -10px rgba(212,160,23,.55)",
        card: "0 10px 30px -12px rgba(10,42,107,.25)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
