import DashboardShell from "../components/dashboard-shell";
import { User } from "@supabase/supabase-js";
import { ReactNode } from "react";

const placeholderUser: User = {
  id: "placeholder",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Auth barrier temporarily removed — render with a placeholder user.
  return <DashboardShell user={placeholderUser}>{children}</DashboardShell>;
}
