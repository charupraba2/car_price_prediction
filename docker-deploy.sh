#!/bin/bash

# Build and run script for Car Price Prediction Docker application

set -e

echo "================================"
echo "Car Price Prediction - Docker"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check Docker Compose installation
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Menu
echo "Select an option:"
echo "1. Build and start (development)"
echo "2. Start (development)"
echo "3. Build and start (production with Nginx)"
echo "4. Stop containers"
echo "5. View logs"
echo "6. Clean up (remove containers and images)"
echo "7. Push to DockerHub"
echo ""

read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        echo -e "${YELLOW}Building and starting development environment...${NC}"
        docker-compose up -d --build
        echo -e "${GREEN}✓ Development environment started${NC}"
        echo "Access the application at: http://localhost:8000"
        ;;
    2)
        echo -e "${YELLOW}Starting development environment...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✓ Development environment started${NC}"
        echo "Access the application at: http://localhost:8000"
        ;;
    3)
        echo -e "${YELLOW}Building and starting production environment...${NC}"
        docker-compose -f docker-compose.prod.yml up -d --build
        echo -e "${GREEN}✓ Production environment started${NC}"
        echo "Access the application at: http://localhost"
        ;;
    4)
        echo -e "${YELLOW}Stopping containers...${NC}"
        docker-compose down
        echo -e "${GREEN}✓ Containers stopped${NC}"
        ;;
    5)
        echo -e "${YELLOW}Fetching logs...${NC}"
        docker-compose logs -f
        ;;
    6)
        read -p "Are you sure you want to remove all containers and images? (y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            echo -e "${YELLOW}Removing containers and images...${NC}"
            docker-compose down -v
            docker rmi car_price_prediction:latest 2>/dev/null || true
            echo -e "${GREEN}✓ Cleanup complete${NC}"
        else
            echo "Cleanup cancelled"
        fi
        ;;
    7)
        read -p "Enter your DockerHub username: " username
        read -p "Enter repository name (default: car_price_prediction): " repo
        repo=${repo:-car_price_prediction}
        
        echo -e "${YELLOW}Building image...${NC}"
        docker build -t $username/$repo:latest .
        
        echo -e "${YELLOW}Pushing to DockerHub...${NC}"
        docker push $username/$repo:latest
        
        echo -e "${GREEN}✓ Image pushed to DockerHub${NC}"
        echo "Repository: $username/$repo:latest"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
