# Deploying the Ralph API to Google Cloud Run

The API is a stateless Docker container (Node 22, listens on `$PORT`). Cloud Run
scales it to zero, so you pay **$0 while idle** and only pay past a generous
monthly free tier.

- **Build context:** repo root. The `Dockerfile` lives at the repo root.
- **Region:** `europe-west2` (London) — matches our UK users and Scrape.do GB.
- **Service name:** `ralph-api`.

---

## One-time setup (you do this once)

### 1. Install the gcloud CLI
```bash
brew install --cask google-cloud-sdk
```

### 2. Create a project and link billing
```bash
gcloud auth login
gcloud projects create ralph-api-prod --name="Ralph API"   # or pick your own id
gcloud config set project ralph-api-prod
```
Then in the console, link a billing account (this is the card; it won't be
charged under the free tier): https://console.cloud.google.com/billing

### 3. Enable the APIs
```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

---

## First deploy (sets env vars; run from the repo root)

`apps/api/cloudrun.env.yaml` is generated from your `.env` (gitignored). It
contains the production values, with `WEB_ORIGIN`/`WEB_URL` pointed at the Vercel
site and dev-only flags stripped.

```bash
gcloud run deploy ralph-api \
  --source . \
  --region europe-west2 \
  --allow-unauthenticated \
  --memory 1Gi --cpu 1 --timeout 120 \
  --min-instances 0 --max-instances 4 \
  --env-vars-file apps/api/cloudrun.env.yaml
```

Cloud Run builds the Dockerfile, pushes the image, and returns a service URL like
`https://ralph-api-xxxxxxxx-nw.a.run.app`. Hit `https://<url>/health` to confirm.

> Env vars set here **persist across future deploys**, so CI never needs your
> secrets.

---

## Point the web app at the new API

Update the Vercel env var (Project → Settings → Environment Variables) then
redeploy the web app:

```
NEXT_PUBLIC_API_URL = https://<your-cloud-run-url>
```

---

## Continuous deploys (GitHub Actions)

`.github/workflows/deploy-api.yml` deploys on pushes to `main` that touch the
API. It needs two GitHub repo secrets:

- `GCP_PROJECT_ID` — e.g. `ralph-api-prod`
- `GCP_SA_KEY` — a service-account JSON key with deploy permissions

Create the service account + key:
```bash
PROJECT=ralph-api-prod
gcloud iam service-accounts create gh-deployer --project "$PROJECT"
SA="gh-deployer@$PROJECT.iam.gserviceaccount.com"
for role in run.admin cloudbuild.builds.editor artifactregistry.admin iam.serviceAccountUser storage.admin; do
  gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$SA" --role="roles/$role"
done
gcloud iam service-accounts keys create gh-key.json --iam-account "$SA"
```
Paste the contents of `gh-key.json` into the `GCP_SA_KEY` secret, then delete the
local file. (Workload Identity Federation is a more secure, keyless alternative
once you want to harden this.)

---

## Cost notes
- `--min-instances 0` → scales to zero → no idle cost (cold start ~1–5s).
- Set `--min-instances 1` later if you want zero cold starts (small always-on cost).
- Free tier (per month): ~2M requests, 360k GB-seconds, 180k vCPU-seconds.
