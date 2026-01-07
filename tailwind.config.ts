import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "selector",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f5fd",
          100: "#b3e1f9",
          200: "#80cdf5",
          300: "#4db9f1",
          400: "#2ba8ec",
          500: "#158ce2", // Main primary color
          600: "#1278c7",
          700: "#0f64ac",
          800: "#0c5091",
          900: "#093c76",
          950: "#062855",
        },
        secondary: {
          50: "#e8faf4",
          100: "#b8f0dd",
          200: "#88e6c6",
          300: "#58dcaf",
          400: "#3ed89d",
          500: "#30d4a1", // Main secondary color
          600: "#2abe8f",
          700: "#24a87d",
          800: "#1e926b",
          900: "#187c59",
          950: "#126647",
        },
        accent: {
          50: "#e8ecf2",
          100: "#bcc7d9",
          200: "#90a2c0",
          300: "#647da7",
          400: "#47638e",
          500: "#29446b", // Main accent color
          600: "#243c5f",
          700: "#1f3453",
          800: "#1a2c47",
          900: "#15243b",
          950: "#101c2f",
        },
        // Override indigo to use primary color for backward compatibility
        indigo: {
          50: "#e6f5fd",
          100: "#b3e1f9",
          200: "#80cdf5",
          300: "#4db9f1",
          400: "#2ba8ec",
          500: "#158ce2",
          600: "#1278c7",
          700: "#0f64ac",
          800: "#0c5091",
          900: "#093c76",
          950: "#062855",
        },
      },
      keyframes: {
        hide: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        slideDownAndFade: {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideLeftAndFade: {
          from: { opacity: "0", transform: "translateX(6px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideUpAndFade: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideRightAndFade: {
          from: { opacity: "0", transform: "translateX(-6px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        dialogOverlayShow: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        dialogContentShow: {
          from: {
            opacity: "0",
            transform: "translate(-50%, -45%) scale(0.95)",
          },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        drawerSlideLeftAndFade: {
          from: { opacity: "0", transform: "translateX(50%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        hide: "hide 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideDownAndFade:
          "slideDownAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideLeftAndFade:
          "slideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideUpAndFade: "slideUpAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideRightAndFade:
          "slideRightAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        drawerSlideLeftAndFade:
          "drawerSlideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        dialogOverlayShow:
          "dialogOverlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        dialogContentShow:
          "dialogContentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}
export default config
