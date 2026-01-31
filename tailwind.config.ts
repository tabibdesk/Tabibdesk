import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "selector",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}", // Tremor components
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }], // 10px
      },
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
        // Tremor theme tokens – Tremor defaults (Tailwind blue scale)
        tremor: {
          brand: {
            faint: "#eff6ff",
            muted: "#bfdbfe",
            subtle: "#60a5fa",
            DEFAULT: "#3b82f6",
            emphasis: "#1d4ed8",
            inverted: "#ffffff",
          },
          background: {
            muted: "rgb(248 250 252)",
            subtle: "rgb(241 245 249)",
            DEFAULT: "rgb(255 255 255)",
            emphasis: "rgb(241 245 249)",
          },
          border: {
            DEFAULT: "rgb(226 232 240)",
          },
          ring: {
            DEFAULT: "rgb(226 232 240)",
          },
          content: {
            subtle: "rgb(100 116 139)",
            DEFAULT: "rgb(71 85 105)",
            emphasis: "rgb(51 65 85)",
            strong: "rgb(30 41 59)",
            inverted: "rgb(255 255 255)",
          },
          title: "rgb(15 23 42)",
          label: "rgb(71 85 105)",
        },
        "dark-tremor": {
          brand: {
            faint: "#172554",
            muted: "#1e3a8a",
            subtle: "#1d4ed8",
            DEFAULT: "#3b82f6",
            emphasis: "#93c5fd",
            inverted: "#172554",
          },
          background: {
            muted: "rgb(15 23 42)",
            subtle: "rgb(30 41 59)",
            DEFAULT: "rgb(15 23 42)",
            emphasis: "rgb(51 65 85)",
          },
          border: {
            DEFAULT: "rgb(51 65 85)",
          },
          ring: {
            DEFAULT: "rgb(51 65 85)",
          },
          content: {
            subtle: "rgb(148 163 184)",
            DEFAULT: "rgb(203 213 225)",
            emphasis: "rgb(226 232 240)",
            strong: "rgb(248 250 252)",
            inverted: "rgb(15 23 42)",
          },
          title: "rgb(248 250 252)",
          label: "rgb(148 163 184)",
        },
      },
      borderRadius: {
        "tremor-small": "0.25rem",
        "tremor-default": "0.375rem",
        "tremor-full": "9999px",
      },
      boxShadow: {
        "tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "dark-tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
        "tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "dark-tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.2)",
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
          from: { opacity: "0", transform: "translateX(100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        drawerSlideRightAndFade: {
          from: { opacity: "0", transform: "translateX(-100%)" },
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
          "drawerSlideLeftAndFade 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        drawerSlideRightAndFade:
          "drawerSlideRightAndFade 300ms cubic-bezier(0.16, 1, 0.3, 1)",
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
