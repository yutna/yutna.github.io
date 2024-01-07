const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/container-queries"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        "cultured": "#f5f5f0",
        "eerie-black": "#191919",
        "isabelline": "#f0f0eb",
        "lavender-indigo": "#9747ff",
        "milk": "#fafaf5",
      },
      fontFamily: {
        sans: ["Public Sans Variable", ...defaultTheme.fontFamily.sans],
      },
    },
  },
};
