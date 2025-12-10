# Docker Setup Guide for Cubing Competition Hub

This guide explains how to build, run, and deploy the Cubing Competition Hub application using Docker.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 1.29 or higher)
- `.env` file with your environment variables (copy from `.env.example`)

## Quick Start

### 1. Build the Docker Image

```bash
docker build -t cubing-comp:latest .
```

### 2. Run with Docker Compose (Production)

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your actual values
nano .env

# Run with docker-compose
docker-compose --profile prod up -d
```

### 3. Access the Application

The application will be available at: `http://localhost:3000`

## Using Docker Commands

### Build the Image

```bash
docker build -t cubing-comp:latest .
```

### Run the Container

```bash
# Interactive mode
docker run -it -p 3000:3000 cubing-comp:latest

# Detached mode
docker run -d -p 3000:3000 --name cubing-app cubing-comp:latest

# With environment variables
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  cubing-comp:latest
```

### Stop the Container

```bash
docker stop cubing-app
```

### View Logs

```bash
docker logs cubing-app
docker logs -f cubing-app  # Follow logs
```

### Remove the Container

```bash
docker rm cubing-app
```

## Using Docker Compose

### Production Deployment

```bash
# Start services
docker-compose --profile prod up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose --profile prod down
```

### Development Setup

```bash
# Start development service (if Dockerfile.dev exists)
docker-compose --profile dev up -d

# View logs
docker-compose logs -f app-dev

# Stop services
docker-compose --profile dev down
```

## Environment Variables

All required environment variables should be in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NODE_ENV=production
PORT=3000
```

## Image Details

### Multi-Stage Build

The Dockerfile uses a multi-stage build for optimal image size:

1. **Builder Stage**: Node.js alpine image
   - Installs dependencies
   - Builds the Next.js application
   - Creates `.next` directory

2. **Production Stage**: Node.js alpine image
   - Copies built application from builder
   - Runs as non-root user (nextjs)
   - Includes health checks

### Security Features

- Non-root user execution (UID: 1001)
- Minimal Alpine Linux base image
- Proper signal handling with dumb-init
- Health checks enabled

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, map to a different port:

```bash
docker run -d -p 8080:3000 cubing-comp:latest
```

Then access at `http://localhost:8080`

### Health Check Failing

The health check endpoint `/api/health` must exist. If it doesn't, either:
1. Create the endpoint
2. Comment out the HEALTHCHECK line in Dockerfile
3. Modify the health check to use a working endpoint

### Container Won't Start

Check the logs:

```bash
docker logs cubing-app
```

Common issues:
- Missing environment variables
- Build errors (check `npm run build`)
- Port conflicts

### Out of Disk Space

Clean up Docker resources:

```bash
# Remove unused images
docker image prune

# Remove unused containers
docker container prune

# Remove all unused resources
docker system prune
```

## Deployment

### To Container Registry (Docker Hub)

```bash
# Tag the image
docker tag cubing-comp:latest yourusername/cubing-comp:latest

# Login to Docker Hub
docker login

# Push the image
docker push yourusername/cubing-comp:latest
```

### To Cloud Platforms

#### AWS ECS

```bash
# Create ECR repository
aws ecr create-repository --repository-name cubing-comp

# Tag and push
docker tag cubing-comp:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/cubing-comp:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/cubing-comp:latest
```

#### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT/cubing-comp

# Deploy
gcloud run deploy cubing-comp \
  --image gcr.io/YOUR_PROJECT/cubing-comp \
  --platform managed \
  --port 3000
```

## Performance Optimization

### .dockerignore

The `.dockerignore` file excludes unnecessary files from the build context, reducing build time and image size.

### Build Caching

Docker caches build layers. To optimize:

1. Put frequently changing files last in Dockerfile
2. Use specific version numbers for base images
3. Separate dependency installation from application copying

## Health Checks

The container includes a health check that verifies the application is responding:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' cubing-app
```

Status can be: `starting`, `healthy`, or `unhealthy`

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment/docker)
- [Alpine Linux Documentation](https://alpinelinux.org/)

## Deployment Notes

Your application is ready for production deployment on Coolify or any Docker-compatible platform.

## Support

For issues or questions about Docker setup, check the Docker logs first:

```bash
docker logs cubing-app
```

If you need help debugging, include:
1. Docker version: `docker --version`
2. Docker Compose version: `docker-compose --version`
3. Container logs: `docker logs container_name`
4. Inspect output: `docker inspect container_name`
