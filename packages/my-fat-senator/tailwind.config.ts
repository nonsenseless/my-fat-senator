import type { Config } from "tailwindcss";


export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  daisyui: {
    themes: ["corporate"]
  },
  safelist:[
      {
        pattern: /top-(\d+|auto)/,
      },
    {
        pattern: /left-(\d+|auto)/,
      }
  ]
} satisfies Config;
