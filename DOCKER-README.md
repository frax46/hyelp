# Docker Deployment Guide for Hyelp

This guide explains how to deploy the Hyelp application using Docker on a Hostinger VPS.

## Prerequisites

- A VPS with Docker and Docker Compose installed
- Access to your domain or subdomain DNS settings
- Your Clerk API keys and other environment variables

## Quick Start (Local Testing)

### Windows
```bash
# Run the provided batch file
.\docker-build.bat
```

### Linux/Mac
```bash
# Make the script executable
chmod +x docker-build.sh

# Run the script
./docker-build.sh
```

## Deploying to Hostinger VPS

1. **Connect to your VPS via SSH**
   ```bash
   ssh username@your-server-ip
   ```

2. **Install Docker if not already installed**
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose
   sudo systemctl enable --now docker
   ```

3. **Clone your repository**
   ```bash
   git clone https://github.com/your-username/hyelp.git
   cd hyelp
   ```

4. **Create a .env file with your actual values**
   ```bash
   nano .env
   ```
   
   Add the following content (replace with your actual values):
   ```
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Admin Emails (comma-separated)
   NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
   
   # Database
   POSTGRES_PASSWORD=secure_password_here
   POSTGRES_USER=hyelp
   POSTGRES_DB=hyelp
   
   # Mapbox
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   ```

5. **Build and start the application**
   ```bash
   docker-compose up -d
   ```

6. **Set up Nginx as a reverse proxy**
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```

   Create an Nginx configuration file:
   ```bash
   sudo nano /etc/nginx/sites-available/hyelp
   ```

   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Enable the site and get SSL certificate**
   ```bash
   sudo ln -s /etc/nginx/sites-available/hyelp /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   
   sudo certbot --nginx -d your-domain.com
   ```

8. **Verify your application is running**
   Open your domain in a browser. The application should be running securely with HTTPS.

## Maintenance Commands

- **View logs**
  ```bash
  docker-compose logs -f
  ```

- **Restart containers**
  ```bash
  docker-compose restart
  ```

- **Stop containers**
  ```bash
  docker-compose down
  ```

- **Update application (after code changes)**
  ```bash
  git pull
  docker-compose down
  docker-compose up -d --build
  ```

## Troubleshooting

- **Container not starting**: Check logs with `docker-compose logs -f`
- **Database connection issues**: Verify your DATABASE_URL environment variable
- **Nginx issues**: Check nginx error logs with `sudo tail -f /var/log/nginx/error.log` 