"use client";

import { useRouter } from "next/navigation";
import { Button } from "@ralph/ui";
import { CTAProps } from "@/app/types";
import { useSession } from "../../lib/supabase";
import { openAuth } from "../../lib/use-auth-dialog";

// The primary "Ask Ralph About This Car" CTA. Logged out → open the sign-in
// modal; logged in → go straight to a new check.
export default function CTA({
  children = "Ask Ralph",
  variant = "primary",
}: CTAProps) {
  const { data: user } = useSession();
  const router = useRouter();

  function handleClick() {
    if (user) {
      router.push("/dashboard/verdict");
    } else {
      openAuth("modal");
    }
  }

  return (
    <Button
      type="button"
      variant={variant === "secondary" ? "secondary" : "primary"}
      size="md"
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
