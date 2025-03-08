# Docker Setup for Hyelp

This document explains how to use Docker to containerize and deploy the Hyelp application.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Configuration

Before building the Docker image, make sure you have the necessary environment variables set. You can create a `.env` file at the root of the project with the following variables:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Admin Emails (comma-separated)
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,admin2@example.com

# Database
DATABASE_URL=postgresql://hyelp:changeme@db:5432/hyelp

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# PostgreSQL (for docker-compose)
POSTGRES_PASSWORD=changeme
POSTGRES_USER=hyelp
POSTGRES_DB=hyelp
```

## Building and Running with Docker Compose

The easiest way to run the application is using Docker Compose:

```bash
# Build and start the containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the containers
docker-compose down
```

This will start both the web application and a PostgreSQL database.

## Building and Running Manually

If you want to build and run the Docker container manually:

```bash
# Build the Docker image
docker build -t hyelp-app \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key \
  --build-arg CLERK_SECRET_KEY=your_secret \
  --build-arg NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com \
  --build-arg DATABASE_URL=your_db_url \
  --build-arg NEXT_PUBLIC_MAPBOX_TOKEN=your_token \
  .

# Run the container
docker run -p 3000:3000 hyelp-app
```

## Production Deployment Considerations

For production deployment:

1. Make sure to set up a proper database with backups
2. Use a reverse proxy like Nginx for SSL termination
3. Consider using container orchestration like Kubernetes for high availability
4. Set up proper logging and monitoring

## Troubleshooting

- **Database Connection Issues**: Ensure the `DATABASE_URL` is correctly set and the database is accessible.
- **Build Failures**: Check the Docker build logs for any error messages.
- **Environment Variables**: Make sure all required environment variables are properly set.

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables for sensitive information rather than hardcoding them
- Consider using Docker secrets for production deployments 