# Docker Setup Guide for SymptomSense

This guide explains how to run SymptomSense using Docker, without needing to install Node.js or dependencies locally.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

## 🚀 Automatic Quick Start (Easiest)

The project includes automatic startup scripts:

```bash
# This automatically handles Docker for you!
npm start
```

The script will:
- ✅ Detect your OS (Windows/Mac/Linux)
- ✅ Check if Docker is running
- ✅ Start containers automatically
- ✅ Show helpful error messages if Docker isn't available

## Manual Quick Start

### Production Build

Run the application in production mode with optimized build:

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at: **http://localhost:4200**

### Development Mode

Run the application in development mode with hot-reload:

```bash
# Build and start in development mode
docker-compose -f docker-compose.dev.yml up

# Stop development container
docker-compose -f docker-compose.dev.yml down
```

## Docker Commands Reference

### Production Commands

```bash
# Build the image
docker-compose build

# Start in detached mode
docker-compose up -d

# Start and rebuild
docker-compose up -d --build

# View logs
docker-compose logs -f symptom-sense

# Stop containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Check container status
docker-compose ps
```

### Development Commands

```bash
# Start development server
docker-compose -f docker-compose.dev.yml up

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build

# Run npm commands inside container
docker-compose -f docker-compose.dev.yml exec symptom-sense-dev npm run test

# Access container shell
docker-compose -f docker-compose.dev.yml exec symptom-sense-dev sh
```

## Configuration

### Port Configuration

By default, the application runs on port 4200. To change this:

**Production:**
Edit `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Change 8080 to your preferred port
```

**Development:**
Edit `docker-compose.dev.yml`:
```yaml
ports:
  - "3000:4200"  # Change 3000 to your preferred port
```

### Environment Variables

Add environment variables in the respective `docker-compose` files:

```yaml
environment:
  - NODE_ENV=production
  - API_URL=https://your-api.com
```

## Troubleshooting

### Port Already in Use

If port 4200 is already in use:

```bash
# Check what's using the port
netstat -ano | findstr :4200  # Windows
lsof -i :4200                 # Mac/Linux

# Change the port in docker-compose.yml
ports:
  - "4201:80"
```

### Container Won't Start

```bash
# Check container logs
docker-compose logs symptom-sense

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Build Errors

```bash
# Clear Docker cache
docker system prune -a

# Remove node_modules and rebuild
docker-compose down
docker volume prune
docker-compose up --build
```

### Permission Issues (Linux/Mac)

```bash
# Fix ownership of generated files
sudo chown -R $USER:$USER .
```

## Architecture

### Production Setup
- **Stage 1**: Node.js Alpine image builds the Angular app
- **Stage 2**: Nginx Alpine serves the static files
- Optimized multi-stage build reduces final image size
- Nginx configured for Angular routing and caching

### Development Setup
- Mounts local code as volume for live reload
- Preserves node_modules in container volume
- Runs Angular development server with hot-reload

## File Structure

```
symptom-sense/
├── Dockerfile              # Production multi-stage build
├── docker-compose.yml      # Production configuration
├── docker-compose.dev.yml  # Development configuration
├── nginx.conf              # Nginx server configuration
├── .dockerignore           # Files to exclude from build
└── DOCKER_SETUP.md         # This file
```

## Benefits

✅ No local Node.js installation required
✅ Consistent environment across all machines
✅ Easy deployment and scaling
✅ Isolated dependencies
✅ Quick setup for new developers

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Angular Docker Guide](https://angular.io/guide/deployment)

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify Docker is running: `docker ps`
3. Ensure ports are available: `netstat -ano | findstr :4200`
4. Try rebuilding: `docker-compose up --build`

