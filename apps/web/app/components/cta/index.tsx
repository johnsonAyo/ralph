import { CTAProps } from "@/app/types";
export default function CTA({ children = "Ask Ralph", variant = "primary" }: CTAProps) {
    return (<a className={`button ${variant}`} href="#check">
      {children}
    </a>);
}
