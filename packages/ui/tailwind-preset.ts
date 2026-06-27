import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Shared Tailwind preset for the whole monorepo. Apps spread this into their
 * own config and only add `content` globs. Colors resolve to the CSS variables
 * defined in @ralph/ui/styles.css, so theming stays centralized.
 */
const hsl = (token: string) => `hsl(var(--${token}) / <alpha-value>)`;

const preset: Omit<Config, "content"> = {
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        border: hsl("border"),
        input: hsl("input"),
        ring: hsl("ring"),
        background: hsl("background"),
        foreground: hsl("foreground"),
        primary: {
          DEFAULT: hsl("primary"),
          foreground: hsl("primary-foreground"),
        },
        secondary: {
          DEFAULT: hsl("secondary"),
          foreground: hsl("secondary-foreground"),
        },
        brand: {
          DEFAULT: hsl("brand"),
          foreground: hsl("brand-foreground"),
        },
        muted: {
          DEFAULT: hsl("muted"),
          foreground: hsl("muted-foreground"),
        },
        accent: {
          DEFAULT: hsl("accent"),
          foreground: hsl("accent-foreground"),
        },
        card: {
          DEFAULT: hsl("card"),
          foreground: hsl("card-foreground"),
        },
        popover: {
          DEFAULT: hsl("popover"),
          foreground: hsl("popover-foreground"),
        },
        success: {
          DEFAULT: hsl("success"),
          foreground: hsl("success-foreground"),
          subtle: hsl("success-subtle"),
          "subtle-foreground": hsl("success-subtle-foreground"),
        },
        warning: {
          DEFAULT: hsl("warning"),
          foreground: hsl("warning-foreground"),
          subtle: hsl("warning-subtle"),
          "subtle-foreground": hsl("warning-subtle-foreground"),
        },
        destructive: {
          DEFAULT: hsl("destructive"),
          foreground: hsl("destructive-foreground"),
          subtle: hsl("destructive-subtle"),
          "subtle-foreground": hsl("destructive-subtle-foreground"),
        },
        info: {
          DEFAULT: hsl("info"),
          foreground: hsl("info-foreground"),
          subtle: hsl("info-subtle"),
          "subtle-foreground": hsl("info-subtle-foreground"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 6px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      fontSize: {
        // Editorial display scale with tight tracking baked in via lineHeight.
        display: ["clamp(2.25rem, 5vw, 3.75rem)", { lineHeight: "1.04", letterSpacing: "-0.02em" }],
        hero: ["clamp(1.75rem, 3.4vw, 2.75rem)", { lineHeight: "1.08", letterSpacing: "-0.015em" }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default preset;
