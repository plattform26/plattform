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
        background: "var(--background)",
        foreground: "var(--foreground)",
        cyan: {
          400: "#00f2ff",
          500: "#00d1dc",
        },
        purple: {
          500: "#7000ff",
          600: "#5a00cc",
        },
      },
    },
  },
  plugins: [],
};
export default config;
