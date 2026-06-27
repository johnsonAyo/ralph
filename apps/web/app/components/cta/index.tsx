import { Button } from "@ralph/ui";
import { CTAProps } from "@/app/types";

export default function CTA({
  children = "Ask Ralph",
  variant = "primary",
}: CTAProps) {
  return (
    <Button asChild variant={variant === "secondary" ? "secondary" : "primary"}>
      <a href="#check">{children}</a>
    </Button>
  );
}
