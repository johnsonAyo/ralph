import { User } from "@supabase/supabase-js";

export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return "Friend";
  
  // 1. Try to get name from OAuth metadata
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
  if (fullName && typeof fullName === "string") {
    return fullName.split(" ")[0]; // Just return the first name
  }

  // 2. Fallback: Extract from email
  if (user.email) {
    const emailPrefix = user.email.split("@")[0];
    
    // Strip out numbers, dots, dashes, underscores to find the alphabet name part
    // e.g. john.doe123 -> john
    const namePart = emailPrefix.split(/[0-9._-]/)[0];
    
    if (namePart && namePart.length > 0) {
      // Capitalize first letter
      return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
    }
  }

  return "Friend";
}

export function getUserInitials(user: User | null | undefined): string {
  if (!user) return "?";

  const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
  if (fullName && typeof fullName === "string") {
    const parts = fullName.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  if (user.email) {
    const name = getUserDisplayName(user);
    if (name !== "Friend") {
      return name.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  }

  return "?";
}
