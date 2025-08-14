#!/bin/bash

# Deployment Comparison Script
# This script helps you compare the performance of original vs optimized deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${CYAN}================================================${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}================================================${NC}"
}

print_status() {
    echo -e "${BLUE}🔍 $1${NC}"
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

# Function to format time
format_time() {
    local total_seconds=$1
    local minutes=$((total_seconds / 60))
    local seconds=$((total_seconds % 60))
    echo "${minutes}m ${seconds}s"
}

print_header "Deployment Performance Comparison Tool"

echo "This script will help you compare:"
echo "1. Original deployment (deploy.sh)"
echo "2. Optimized deployment (deploy-cached.sh)"
echo ""

# Check if both scripts exist
if [[ ! -f "deploy.sh" ]]; then
    print_error "deploy.sh not found!"
    exit 1
fi

if [[ ! -f "deploy-cached.sh" ]]; then
    print_error "deploy-cached.sh not found!"
    exit 1
fi

# Check if scripts are executable
if [[ ! -x "deploy.sh" ]]; then
    print_warning "Making deploy.sh executable..."
    chmod +x deploy.sh
fi

if [[ ! -x "deploy-cached.sh" ]]; then
    print_warning "Making deploy-cached.sh executable..."
    chmod +x deploy-cached.sh
fi

echo "Choose deployment to test:"
echo "1) Test Original Deployment (deploy.sh)"
echo "2) Test Optimized Deployment (deploy-cached.sh)"
echo "3) Test Both and Compare"
echo "4) Show Current Docker Images"
echo "5) Clean Docker Cache"
echo "6) Exit"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        print_header "Testing Original Deployment"
        print_status "Starting original deployment..."
        start_time=$(date +%s)
        
        if ./deploy.sh; then
            end_time=$(date +%s)
            duration=$((end_time - start_time))
            print_success "Original deployment completed in $(format_time $duration)"
        else
            print_error "Original deployment failed!"
        fi
        ;;
        
    2)
        print_header "Testing Optimized Deployment"
        print_status "Starting optimized deployment..."
        start_time=$(date +%s)
        
        if ./deploy-cached.sh; then
            end_time=$(date +%s)
            duration=$((end_time - start_time))
            print_success "Optimized deployment completed in $(format_time $duration)"
        else
            print_error "Optimized deployment failed!"
        fi
        ;;
        
    3)
        print_header "Comparing Both Deployments"
        
        # Test original first
        print_status "Testing original deployment..."
        start_time_original=$(date +%s)
        
        if ./deploy.sh; then
            end_time_original=$(date +%s)
            duration_original=$((end_time_original - start_time_original))
            print_success "Original deployment: $(format_time $duration_original)"
        else
            print_error "Original deployment failed!"
            exit 1
        fi
        
        echo ""
        print_status "Waiting 30 seconds before testing optimized deployment..."
        sleep 30
        
        # Test optimized
        print_status "Testing optimized deployment..."
        start_time_optimized=$(date +%s)
        
        if ./deploy-cached.sh; then
            end_time_optimized=$(date +%s)
            duration_optimized=$((end_time_optimized - start_time_optimized))
            print_success "Optimized deployment: $(format_time $duration_optimized)"
        else
            print_error "Optimized deployment failed!"
            exit 1
        fi
        
        # Calculate improvement
        echo ""
        print_header "Performance Comparison Results"
        echo -e "Original Deployment:  ${RED}$(format_time $duration_original)${NC}"
        echo -e "Optimized Deployment: ${GREEN}$(format_time $duration_optimized)${NC}"
        
        if [[ $duration_optimized -lt $duration_original ]]; then
            improvement=$((100 - (duration_optimized * 100 / duration_original)))
            time_saved=$((duration_original - duration_optimized))
            echo -e "Time Saved:          ${GREEN}$(format_time $time_saved)${NC}"
            echo -e "Performance Gain:    ${GREEN}${improvement}% faster${NC}"
            
            if [[ $improvement -ge 70 ]]; then
                print_success "Excellent! Achieved expected 70%+ improvement!"
            elif [[ $improvement -ge 50 ]]; then
                print_success "Good improvement! Consider further optimizations."
            else
                print_warning "Moderate improvement. Check caching effectiveness."
            fi
        else
            print_warning "Optimized deployment was slower. Check cache setup."
        fi
        ;;
        
    4)
        print_header "Current Docker Images"
        print_status "Listing Docker images..."
        docker images | grep -E "(telusrecruitai|gcr.io)" || echo "No telusrecruitai images found"
        ;;
        
    5)
        print_header "Cleaning Docker Cache"
        print_status "Cleaning Docker system..."
        docker system prune -f
        print_status "Cleaning Docker builder cache..."
        docker builder prune -f
        print_success "Docker cache cleaned!"
        ;;
        
    6)
        print_status "Exiting..."
        exit 0
        ;;
        
    *)
        print_error "Invalid choice. Please select 1-6."
        exit 1
        ;;
esac

echo ""
print_header "Comparison Complete"
echo "Tips for better performance:"
echo "• First optimized build may be slower (no cache)"
echo "• Subsequent builds should be 70-80% faster"
echo "• Monitor cache hit rates in build logs"
echo "• Use 'docker system df' to check cache usage"
