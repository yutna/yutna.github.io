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
      backgroundImage: {
        "gradient-dark-silver":
          "linear-gradient(112deg, #171717 3.96%, rgba(23, 23, 23, 0.4) 119.41%)",
        "gradient-silver":
          "linear-gradient(112deg, #f9f9f9 3.96%, rgba(133, 138, 146, 0) 119.41%)",
        "gradient-violet-neon":
          "linear-gradient(91.92deg, #7852fe 5.45%, #8a09cd 47.89%, #e21bda 88.9%)",
      },
      boxShadow: {
        "violet-neon":
          "0px 0px 10px rgba(151, 71, 255, 0.8), inset 0px 6.91px 25.35px #9747ff, inset 0px -7px 9.22px rgba(234, 218, 255, 0.25)",
        "violet-neon-md":
          "0px 0px 29.9px rgba(151, 71, 255, 0.8), inset 0px 6.91px 25.35px #9747ff, inset 0px -7px 9.22px rgba(234, 218, 255, 0.25)",
        "violet-neon-lg":
          "4px 0px 20px #9747ff, 0px 0px 29.9px rgba(151, 71, 255, 0.8), inset 0px 6.91px 25.35px #9747ff, inset 0px -7px 9.22px rgba(234, 218, 255, 0.25)",
      },
      colors: {
        "cultured": "#f5f5f0",
        "eerie-black": "#191919",
        "isabelline": "#f0f0eb",
        "lavender-indigo": "#9747ff",
        "milk": "#fafaf5",
      },
      fontFamily: {
        mono: ["Noto Sans Mono Variable", ...defaultTheme.fontFamily.mono],
      },
    },
  },
};
