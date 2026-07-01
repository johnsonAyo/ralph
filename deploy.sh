#!/bin/bash

# Fast Deployment Script for Google Cloud VM

echo "🚀 Starting fast local build..."
pnpm build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Aborting deployment."
  exit 1
fi

echo "📦 Compressing files for ultra-fast upload..."
zip -r upload.zip apps/api/dist apps/web/.next package.json pnpm-lock.yaml ecosystem.config.js apps/api/package.json apps/web/package.json

echo "🚀 Uploading to server..."
gcloud compute scp upload.zip ralph-server:~/ralph/ --zone=us-east1-b
rm upload.zip

echo "🔄 Extracting and restarting server apps via PM2..."
gcloud compute ssh ralph-server --zone=us-east1-b --command="
cd ~/ralph
unzip -o upload.zip
rm upload.zip
# Optional: if dependencies changed, uncomment the next line
# pnpm install --prod
pm2 delete all || true
pm2 start ecosystem.config.js
pm2 save
"

echo "✅ Deployment complete! Your app is live."
