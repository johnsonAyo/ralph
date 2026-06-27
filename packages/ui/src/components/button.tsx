import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * Button variants mirror the product's original `.button` styles so primitives
 * render identically to the current design (blue pill, soft blue shadow,
 * blue-dark hover lift). Refine from tokens later.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-black leading-none transition-[transform,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-55 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[0_14px_28px_rgba(47,98,233,0.2)] hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(47,98,233,0.27)] disabled:shadow-none disabled:translate-y-0",
        gold: "bg-gold text-gold-foreground shadow-[0_14px_28px_rgba(255,216,77,0.28)] hover:-translate-y-0.5 hover:brightness-95 disabled:shadow-none disabled:translate-y-0",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:bg-border",
        outline: "border border-border bg-card text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        link: "font-bold text-primary underline-offset-4 hover:underline",
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-95",
      },
      size: {
        sm: "min-h-[40px] rounded-[14px] px-4 text-sm",
        md: "min-h-[48px] rounded-2xl px-5 text-sm",
        lg: "min-h-[56px] rounded-[21px] px-[30px] text-[0.95rem]",
        icon: "size-11 rounded-2xl",
        // No sizing — for wrapping existing bespoke-classed buttons whose own
        // CSS controls height/padding/radius during incremental migration.
        none: "",
      },
    },
    defaultVariants: { variant: "primary", size: "lg" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
