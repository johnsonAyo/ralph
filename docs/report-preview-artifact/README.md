# Rich report artifact (preserved)

This is the **rich "sample report" UI** that originally lived at
`apps/web/app/components/report-preview.tsx` and was powered by the `.report-*`
CSS in `globals.css`. Both were removed from the live app during the dashboard
rebuild, but the design is valuable, so they're preserved here for future use.

It is **isolated on purpose** — these files are NOT compiled by Next.js or
type-checked (they sit outside `apps/web/app`). They reference UI/CSS that no
longer exists in the app, so don't import them directly without reviving first.

## Files
- `report-preview.tsx` — the rich report component (hardcoded sample data).
- `report-artifact.css` — the `.report-*` styles it depends on.

## What's valuable here (concepts to bring into the live report later)
- **Verdict hero** with summary chips (Budget fit · Certainty · Main concern · Expert review).
- **Sticky summary dock** + mini section nav.
- **Bid limit** framed with a *skip point* ("advise skipping above £X", "room before skip") — not just a ceiling.
- **Reasons with severity** (Major / Watch / Helpful) + evidence per reason.
- **"What Ralph noticed"** — per-photo clues that changed the verdict.
- **Repair allowance** as a £ range + likely-work chips + hidden-checks chips ("an allowance, not a quote").
- **"What Ralph couldn't verify"** and a **"Before you bid"** checklist.
- **"See how Ralph got this" reasoning drawer** (slide-out with deep accordions + TOC).
- **Expert review** upsell + **after-auction follow-up** tracker.

## Important caveat
Every value in `report-preview.tsx` is a **hardcoded string** — it was a
marketing/sample artifact. To make these sections real on a live report, the
analysis output (`reportResultSchema` in `packages/shared`) and the analyser
prompt must be extended to produce the extra fields (severity-rated reasons,
repair-allowance range, skip point, photo observations, "couldn't verify",
"before you bid"), and the report page rebuilt to render them.

## To revive
1. Copy `report-preview.tsx` back into `apps/web/app/components/` (and split the
   drawer/section helpers if desired).
2. Paste `report-artifact.css` back into `apps/web/app/globals.css` (or, better,
   convert to Tailwind / a CSS module to keep globals thin).
3. Wire it to real data once the analyser produces the richer fields.
