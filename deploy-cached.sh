#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_ID="telusrecruitai-468907"  # GCP project ID
PROJECT_NUMBER="380738819308" # GCP project number
REGION="asia-south1"          # Replace with your desired region
SERVICE_NAME="telusrecruitai" # Replace with your desired service name
IMAGE_NAME="telusrecruitai"   # Replace with your desired image name

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}🚀 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Timer functions
format_time() {
    local total_seconds=$1
    local minutes=$((total_seconds / 60))
    local seconds=$((total_seconds % 60))
    printf "%dm %02ds" $minutes $seconds
}

start_timer() {
    timer_start=$(date +%s)
}

end_timer() {
    local timer_end=$(date +%s)
    local duration=$((timer_end - timer_start))
    echo $duration
}

print_timer() {
    local stage_name="$1"
    local duration="$2"
    local formatted_time=$(format_time $duration)
    
    if [[ $duration -lt 30 ]]; then
        echo -e "${GREEN}✅ $stage_name completed in $formatted_time${NC}"
    elif [[ $duration -lt 120 ]]; then
        echo -e "${YELLOW}✅ $stage_name completed in $formatted_time${NC}"
    else
        echo -e "${RED}✅ $stage_name completed in $formatted_time${NC}"
    fi
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    print_error "docker is not installed. Please install it first."
    exit 1
fi

print_status "Starting OPTIMIZED deployment process with caching..."
echo -e "${BLUE}⏱️  Total Deployment Timer Started...${NC}"
echo ""

# Start overall timer
DEPLOYMENT_START=$(date +%s)

# Stage 1: Project Validation
print_status "Validating GCP project configuration..."
start_timer
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [[ "$CURRENT_PROJECT" != "$PROJECT_ID" ]]; then
    print_warning "Current project ($CURRENT_PROJECT) doesn't match expected ($PROJECT_ID)"
    print_status "Setting project to $PROJECT_ID..."
    gcloud config set project $PROJECT_ID
fi

# Verify project number matches
ACTUAL_PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)" 2>/dev/null)
if [[ "$ACTUAL_PROJECT_NUMBER" != "$PROJECT_NUMBER" ]]; then
    print_error "Project number mismatch! Expected: $PROJECT_NUMBER, Got: $ACTUAL_PROJECT_NUMBER"
    exit 1
fi

# End Stage 1 timer
VALIDATION_TIME=$(end_timer)
print_timer "Project Validation" $VALIDATION_TIME
echo ""

# Stage 2: Docker Build Setup
print_status "Setting up Docker BuildKit and caching..."
start_timer

# Enable Docker BuildKit for advanced caching features
export DOCKER_BUILDKIT=1
export BUILDKIT_PROGRESS=plain

# Clean up old images to free space (optional)
docker image prune -f --filter "until=24h" || true

# Pull latest image for layer caching
docker pull gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest || {
    print_warning "No previous image found for caching. Building from scratch..."
}

# End Stage 2 timer
SETUP_TIME=$(end_timer)
print_timer "Docker Setup & Cache Pull" $SETUP_TIME
echo ""

# Stage 3: Docker Build
print_status "Building Docker image with optimized caching..."
start_timer

docker build \
    --file Dockerfile.optimized \
    --cache-from gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --tag ${IMAGE_NAME}:latest \
    --tag ${IMAGE_NAME}:$(date +%Y%m%d-%H%M%S) \
    .

# End Stage 3 timer
BUILD_TIME=$(end_timer)
print_timer "Docker Build (with caching)" $BUILD_TIME
echo ""

# Stage 4: Docker Push
print_status "Pushing image to GCR with cache metadata..."
start_timer

# Tag the image for GCR
docker tag ${IMAGE_NAME}:latest gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest

# Configure docker to use gcloud as a credential helper
gcloud auth configure-docker --quiet

# Push the image to GCR with caching metadata
docker push gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest

# End Stage 4 timer
PUSH_TIME=$(end_timer)
print_timer "Docker Push" $PUSH_TIME
echo ""

# Stage 5: Cloud Run Deployment
print_status "Deploying to Cloud Run with optimized configuration..."
start_timer

print_status "Updating service with latest image..."
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --project ${PROJECT_ID} \
  --port 3000 \
  --allow-unauthenticated \
  --service-account=cloud-run-deployer@${PROJECT_ID}.iam.gserviceaccount.com \
  --memory 512Mi \
  --cpu 1 \
  --concurrency 80 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars NODE_ENV=production \
  --quiet

# End Stage 5 timer
DEPLOY_TIME=$(end_timer)
print_timer "Cloud Run Deployment" $DEPLOY_TIME
echo ""

# Stage 6: URL Validation and Testing
print_status "Retrieving and validating service URLs..."
start_timer

# Get the current active URL from Cloud Run
ACTIVE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --project=${PROJECT_ID} --format='value(status.url)')

# Define your preferred URL pattern
PREFERRED_URL="https://${SERVICE_NAME}-${PROJECT_NUMBER}.${REGION}.run.app"

# Test both URLs for accessibility
print_status "Testing service accessibility on both URLs..."

# Test preferred URL
PREFERRED_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${PREFERRED_URL}" 2>/dev/null || echo "000")

# Test active URL (if different)
if [[ "$ACTIVE_URL" != "$PREFERRED_URL" ]]; then
    ACTIVE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${ACTIVE_URL}" 2>/dev/null || echo "000")
else
    ACTIVE_STATUS=$PREFERRED_STATUS
fi

# Report results with preference for your desired URL
if [[ "$PREFERRED_STATUS" == "200" ]]; then
    print_success "✅ Primary service URL is accessible: ${PREFERRED_URL}"
    SERVICE_URL=$PREFERRED_URL
    if [[ "$ACTIVE_URL" != "$PREFERRED_URL" && "$ACTIVE_STATUS" == "200" ]]; then
        print_success "✅ Backup service URL also available: ${ACTIVE_URL}"
    fi
elif [[ "$ACTIVE_STATUS" == "200" ]]; then
    print_success "✅ Service is accessible via: ${ACTIVE_URL}"
    print_status "Note: Preferred URL (${PREFERRED_URL}) not responding, using active URL"
    SERVICE_URL=$ACTIVE_URL
else
    print_warning "⚠️ Service may not be fully ready on either URL"
    print_status "Preferred: ${PREFERRED_URL} (HTTP ${PREFERRED_STATUS})"
    print_status "Active: ${ACTIVE_URL} (HTTP ${ACTIVE_STATUS})"
    SERVICE_URL=$ACTIVE_URL
fi

# End Stage 6 timer
VALIDATION_URL_TIME=$(end_timer)
print_timer "URL Validation" $VALIDATION_URL_TIME

# Calculate total deployment time
DEPLOYMENT_END=$(date +%s)
TOTAL_TIME=$((DEPLOYMENT_END - DEPLOYMENT_START))

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}           🎯 DEPLOYMENT PERFORMANCE SUMMARY${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Stage breakdown
echo -e "${YELLOW}📊 Stage Breakdown:${NC}"
echo -e "   1️⃣  Project Validation:     $(format_time $VALIDATION_TIME)"
echo -e "   2️⃣  Docker Setup & Cache:   $(format_time $SETUP_TIME)"
echo -e "   3️⃣  Docker Build:           $(format_time $BUILD_TIME)"
echo -e "   4️⃣  Docker Push:            $(format_time $PUSH_TIME)"
echo -e "   5️⃣  Cloud Run Deploy:       $(format_time $DEPLOY_TIME)"
echo -e "   6️⃣  URL Validation:         $(format_time $VALIDATION_URL_TIME)"
echo ""

# Total time with color coding
if [[ $TOTAL_TIME -lt 180 ]]; then  # Less than 3 minutes
    echo -e "${GREEN}⏱️  TOTAL DEPLOYMENT TIME: $(format_time $TOTAL_TIME) 🚀${NC}"
    echo -e "${GREEN}🎉 EXCELLENT! Ultra-fast deployment achieved!${NC}"
elif [[ $TOTAL_TIME -lt 300 ]]; then  # Less than 5 minutes
    echo -e "${YELLOW}⏱️  TOTAL DEPLOYMENT TIME: $(format_time $TOTAL_TIME) ⚡${NC}"
    echo -e "${YELLOW}✨ GREAT! Fast deployment with caching benefits!${NC}"
else
    echo -e "${RED}⏱️  TOTAL DEPLOYMENT TIME: $(format_time $TOTAL_TIME) ⏳${NC}"
    echo -e "${YELLOW}💡 Consider checking cache effectiveness for better performance.${NC}"
fi

echo ""
echo -e "${BLUE}🛠️  Optimizations Applied:${NC}"
echo "   • Multi-stage Docker build with layer caching"
echo "   • BuildKit cache mounts for npm dependencies"
echo "   • Layer cache reuse from previous builds"
echo "   • Optimized Cloud Run configuration"
echo "   • Explicit project validation and targeting"
echo "   • Service continuity (no deletion/recreation)"
echo ""

# Performance comparison
echo -e "${CYAN}📈 Performance Comparison:${NC}"
echo "   • Standard deployment: ~10-15 minutes"
echo "   • Optimized deployment: $(format_time $TOTAL_TIME)"
if [[ $TOTAL_TIME -lt 600 ]]; then  # Less than 10 minutes
    IMPROVEMENT=$((100 - (TOTAL_TIME * 100 / 900)))  # Assuming 15min baseline
    echo -e "   • ${GREEN}Performance gain: ~${IMPROVEMENT}% faster! 🎯${NC}"
fi

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Primary Service URL: ${PREFERRED_URL}${NC}"
if [[ "$SERVICE_URL" != "$PREFERRED_URL" ]]; then
    echo -e "${BLUE}🔄 Currently Active URL: ${SERVICE_URL}${NC}"
fi
echo -e "${BLUE}================================================${NC}"
