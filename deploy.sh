#!/bin/bash
# Deploy Shore Thing Booking System to Google Cloud Run
set -euo pipefail

PROJECT_ID="${1:-$(gcloud config get-value project)}"
REGION="us-east1"
SERVICE_NAME="shore-thing-booking"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying ${SERVICE_NAME} to Google Cloud Run..."

# Build and push
gcloud builds submit --tag "${IMAGE}" --project "${PROJECT_ID}"

# Deploy
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 120 \
  --set-env-vars "PERPLEXITY_API_KEY=$(gcloud secrets versions access latest --secret=perplexity-api-key --project=${PROJECT_ID} 2>/dev/null || echo 'SET_YOUR_KEY')" \
  --project "${PROJECT_ID}"

echo "✅ Deployed!"
gcloud run services describe "${SERVICE_NAME}" --platform managed --region "${REGION}" --format 'value(status.url)' --project "${PROJECT_ID}"
