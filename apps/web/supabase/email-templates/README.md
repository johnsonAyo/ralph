# Ralph email templates

Branded, mobile-friendly, email-client-safe HTML for Ralph's emails — cream
background, white card, blue CTA, "R" logo badge. Each file IS the email: paste
the HTML in and it renders as the styled email your users receive (not as code).

## Supabase Auth emails (paste into the dashboard)
Supabase dashboard → **Authentication → Emails → Templates** → pick the template,
paste the matching file's full HTML, save.

| File | Supabase template | Used when |
|------|-------------------|-----------|
| `magic-link.html` | **Magic Link** | Current passwordless flow (`signInWithOtp`). |
| `confirm-signup.html` | **Confirm signup** | If you enable email+password signups. |
| `reset-password.html` | **Reset Password** | If you enable passwords. |

Only variable used: `{{ .ConfirmationURL }}` (Supabase fills it in).

## Lifecycle email (sent by you, not Supabase Auth)
| File | What it is |
|------|-----------|
| `welcome.html` | A "welcome / you're in" email to send after signup. **Not** a Supabase Auth template — send it from a transactional sender (Resend, Postmark, or a Supabase Edge Function). Update the button URL to your live site. |

## Notes
- Tables + inline styles + an MSO fallback button → renders in Gmail, Apple Mail, Outlook.
- The "R" logo is drawn with HTML/CSS (matches the app logo, no image hosting
  needed). To use a real PNG logo instead, host the image and swap the logo cell
  for `<img src="https://…/logo.png" width="40" height="40" alt="Ask Ralph">`.
- Set a friendly sender name ("Ask Ralph") and, for deliverability, a custom SMTP
  sender under Authentication → Emails → SMTP settings.
- "Expires in 1 hour" matches Supabase's default OTP expiry — update if you change it.
