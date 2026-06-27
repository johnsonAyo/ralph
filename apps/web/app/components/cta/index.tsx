import { Button } from "@ralph/ui";
import { ArrowRight } from "lucide-react";
import { CTAProps } from "@/app/types";

export default function CTA({
  children = "Ask Ralph",
  variant = "primary",
}: CTAProps) {
  return (
    <Button
      asChild
      size="lg"
      variant={variant === "secondary" ? "outline" : "primary"}
    >
      <a href="#check">
        {children}
        <ArrowRight />
      </a>
    </Button>
  );
}
