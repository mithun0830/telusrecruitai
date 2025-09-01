#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID="telusrecruitai-468907"  # GCP project ID
REGION="asia-south1"          # Replace with your desired region
SERVICE_NAME="telusrecruitai" # Replace with your desired service name
IMAGE_NAME="telusrecruitai"   # Replace with your desired image name

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: docker is not installed. Please install it first."
    exit 1
fi

echo "🚀 Starting deployment process..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME} .

# Tag the image for GCR
echo "🏷️ Tagging image for GCR..."
docker tag ${IMAGE_NAME} gcr.io/${PROJECT_ID}/${IMAGE_NAME}

# Configure docker to use gcloud as a credential helper
echo "🔑 Configuring docker authentication..."
gcloud auth configure-docker

# Push the image to GCR
echo "☁️ Pushing image to GCR..."
docker push gcr.io/${PROJECT_ID}/${IMAGE_NAME}

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --port 3000 \
  --allow-unauthenticated

echo "✅ Deployment completed successfully!"
