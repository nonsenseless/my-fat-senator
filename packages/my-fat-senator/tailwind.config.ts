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
    themes: [
      {
        senator: {
          "primary": "#1a3a5c",
          "primary-content": "#ffffff",
          "secondary": "#9b1b30",
          "secondary-content": "#ffffff",
          "accent": "#4a6fa5",
          "accent-content": "#ffffff",
          "neutral": "#2d3436",
          "neutral-content": "#f5f5f5",
          "base-100": "#f8f9fa",
          "base-200": "#e9ecef",
          "base-300": "#dee2e6",
          "base-content": "#2d3436",
          "info": "#3b82f6",
          "success": "#22c55e",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
    ],
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
