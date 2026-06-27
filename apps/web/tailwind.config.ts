import type { Config } from "tailwindcss";
import preset from "@ralph/ui/tailwind-preset";

export default {
  presets: [preset],
  
  
  
  corePlugins: { preflight: false },
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
} satisfies Config;
