import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"], .dark'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--surface)",
          subtle: "var(--surface-subtle)",
          raised: "var(--surface-raised)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--ring)",
        },
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },

        // Backward compatibility mappings for existing component tokens
        "text-primary": "var(--foreground)",
        "text-secondary": "var(--muted-foreground)",
        "text-tertiary": "var(--muted-foreground)",
        "surface-base": "var(--surface)",
        "surface-muted": "var(--surface-subtle)",
        "surface-raised": "var(--surface-raised)",
        "surface-strong": "var(--accent)",
        "action-primary": "var(--primary)",
        "action-primary-text": "var(--primary-foreground)",
        "action-secondary": "var(--secondary)",
        "action-secondary-text": "var(--secondary-foreground)",
        "action-focus": "var(--ring)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "calc(var(--radius) - 2px)",
        md: "var(--radius)",
        lg: "calc(var(--radius) + 2px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        xs: "calc(var(--radius) - 4px)",
      },
      maxWidth: {
        content: "1120px",
      },
      boxShadow: {
        theme: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-spread) var(--shadow-color)",
        paper: "0 1px 2px rgba(0, 0, 0, 0.05)",
        "paper-elevated": "0 4px 12px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
