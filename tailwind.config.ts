import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2D5016", // Deep green - paint branding
          hover: "#203a10",
        },
        secondary: {
          DEFAULT: "#E8B44D", // Gold accent
          hover: "#d4a03b",
        },
        accent: {
          DEFAULT: "#DC2626", // Red - CTA
          hover: "#b91c1c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
