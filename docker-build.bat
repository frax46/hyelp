@echo off
echo Building the Docker image...
docker build -t hyelp:latest .

echo Checking for .env file...
if not exist .env (
    echo Creating a sample .env file...
    (
    echo # Clerk Authentication
    echo NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    echo CLERK_SECRET_KEY=your_clerk_secret_key
    echo.
    echo # Admin Emails (comma-separated^)
    echo NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
    echo.
    echo # Database
    echo POSTGRES_PASSWORD=changeme
    echo POSTGRES_USER=hyelp
    echo POSTGRES_DB=hyelp
    echo.
    echo # Mapbox
    echo NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
    ) > .env
    
    echo .env file created. Please update with your real values.
    echo Edit the .env file before continuing.
    exit /b 1
)

echo Starting Docker containers...
docker-compose up -d

echo Containers are now running.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down 