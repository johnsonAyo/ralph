import type { Config } from "tailwindcss";
import preset from "@ralph/ui/tailwind-preset";

export default {
  presets: [preset],
  // Coexistence: the legacy globals.css owns the base/reset, so Tailwind's
  // preflight stays off. Tailwind only emits the component/utility classes
  // that @ralph/ui primitives use.
  corePlugins: { preflight: false },
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
} satisfies Config;
