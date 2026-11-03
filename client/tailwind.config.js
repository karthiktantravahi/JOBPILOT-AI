/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        }
      }
    },
  },
  plugins: [
    // DaisyUI plugin
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#3b82f6",
          "primary-focus": "#2563eb",
          "primary-content": "#ffffff",
          secondary: "#10b981",
          accent: "#8b5cf6",
          neutral: "#1f2937",
          "base-100": "#0f172a",
          "base-200": "#1e293b",
          "base-300": "#334155",
          "base-content": "#f8fafc",
          info: "#06b6d4",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#2563eb",
          "primary-focus": "#1d4ed8",
          "primary-content": "#ffffff",
          secondary: "#059669",
          accent: "#7c3aed",
          neutral: "#374151",
          "base-100": "#ffffff",
          "base-200": "#f8fafc",
          "base-300": "#e2e8f0",
          "base-content": "#0f172a",
          info: "#0284c7",
          success: "#16a34a",
          warning: "#d97706",
          error: "#dc2626",
        },
      },
      "corporate",
      "night",
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
  },
}
