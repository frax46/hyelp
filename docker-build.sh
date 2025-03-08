#!/bin/bash

# Exit on error
set -e

# Build the Docker image
echo "Building the Docker image..."
docker build -t hyelp:latest .

# Create a .env file for Docker if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating a sample .env file..."
  cat > .env << EOF
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Admin Emails (comma-separated)
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com

# Database
POSTGRES_PASSWORD=changeme
POSTGRES_USER=hyelp
POSTGRES_DB=hyelp

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
EOF
  echo ".env file created. Please update with your real values."
  echo "Edit the .env file before continuing."
  exit 1
fi

# Run Docker Compose
echo "Starting Docker containers..."
docker-compose up -d

echo "Containers are now running."
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down" 