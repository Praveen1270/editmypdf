import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-family-stack)"],
      },
      colors: {
        // Direct semantic design tokens
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-tertiary": "var(--color-text-tertiary)",

        "surface-base": "var(--color-surface-base)",
        "surface-muted": "var(--color-surface-muted)",
        "surface-raised": "var(--color-surface-raised)",
        "surface-strong": "var(--color-surface-strong)",

        "border-subtle": "var(--color-border)",
        "border-strong": "var(--color-border-strong)",

        "action-primary": "var(--color-action-primary)",
        "action-primary-text": "var(--color-action-primary-text)",
        "action-secondary": "var(--color-action-secondary)",
        "action-secondary-text": "var(--color-action-secondary-text)",
        "action-focus": "var(--color-focus)",

        // Existing Tailwind aliases mapped strictly to monochrome tokens
        background: "var(--color-surface-base)",
        foreground: "var(--color-text-primary)",
        muted: {
          DEFAULT: "var(--color-surface-muted)",
          foreground: "var(--color-text-secondary)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        primary: {
          DEFAULT: "var(--color-action-primary)",
          foreground: "var(--color-action-primary-text)",
          hover: "var(--color-action-primary)",
        },
        secondary: {
          DEFAULT: "var(--color-action-secondary)",
          foreground: "var(--color-action-secondary-text)",
        },
        success: {
          DEFAULT: "var(--color-text-primary)",
          foreground: "var(--color-surface-base)",
        },
        destructive: {
          DEFAULT: "var(--color-text-primary)",
          foreground: "var(--color-surface-base)",
        },
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
      },
      maxWidth: {
        content: "1120px",
      },
      transitionDuration: {
        instant: "var(--motion-duration-instant)",
      },
    },
  },
  plugins: [],
};
export default config;
