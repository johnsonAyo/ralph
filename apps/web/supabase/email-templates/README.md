# Ralph email templates (Supabase Auth)

Branded, mobile-friendly, email-client-safe HTML for Supabase's auth emails.
Replaces the plain default Supabase emails with the Ask Ralph look (cream
background, white card, blue CTA, "R" logo).

## How to apply
1. Supabase dashboard → **Authentication → Emails → Templates**.
2. Pick the template, paste the matching file's full HTML into the body, save.

| File | Supabase template | Used when |
|------|-------------------|-----------|
| `magic-link.html` | **Magic Link** | Current flow (`signInWithOtp`) — the passwordless sign-in link. |
| `confirm-signup.html` | **Confirm signup** | Only if you enable email+password signups later. |

## Notes
- The only variable used is `{{ .ConfirmationURL }}` (Supabase fills it in).
- Tables + inline styles + an MSO fallback button, so it renders in Gmail,
  Apple Mail and Outlook.
- Set a friendly **sender name** ("Ask Ralph") and, for best deliverability,
  a custom **SMTP sender** under Authentication → Emails → SMTP settings.
- The link lifetime text ("expires in 1 hour") matches Supabase's default OTP
  expiry — if you change the expiry in Auth settings, update the copy.
