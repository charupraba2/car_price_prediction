# Docker Deployment Guide - Car Price Prediction

## Prerequisites
- Docker installed ([Install Docker](https://docs.docker.com/install/))
- Docker Compose installed ([Install Docker Compose](https://docs.docker.com/compose/install/))

## Quick Start

### 1. Build and Run with Docker Compose (Recommended)
```bash
docker-compose up -d
```
The application will be available at `http://localhost:8000` in your browser.

> Note: `http://0.0.0.0:8000` is an internal bind address and will not work in the browser.

### 2. Build Docker Image Manually
```bash
docker build -t car_price_prediction:latest .
```

### 3. Run Docker Container
```bash
docker run -p 8000:8000 \
  -v $(pwd)/model:/app/model \
  -v $(pwd)/datasets:/app/datasets \
  car_price_prediction:latest
```

## Available Endpoints

- **Home Page**: `http://localhost:8000/`
- **Prediction UI**: `http://localhost:8000/predict-ui`
- **History UI**: `http://localhost:8000/history-ui`
- **API Prediction**: `POST http://localhost:8000/api/predict`

## Docker Commands

### View running containers
```bash
docker ps
```

### View container logs
```bash
docker logs car_price_prediction_app
```

### Stop the application
```bash
docker-compose down
```

### Rebuild the image
```bash
docker-compose up -d --build
```

### Remove the image
```bash
docker rmi car_price_prediction:latest
```

## Environment Variables
The app uses these environment variables (can be modified in `docker-compose.yml`):
- `PYTHONUNBUFFERED=1` - Ensures Python output is sent straight to logs

## Volumes
- `/app/model` - Model persistence
- `/app/datasets` - Dataset persistence

## Health Check
The container includes a health check that verifies the API is responding.

## Production Deployment

### Using Gunicorn with Uvicorn Workers (Optional)
Update the CMD in Dockerfile:
```dockerfile
CMD ["gunicorn", "app:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

Then update requirements.txt:
```
gunicorn==22.0.0
```

### Deploy to Cloud Platforms

#### AWS ECS
```bash
docker build -t car_price_prediction:latest .
docker tag car_price_prediction:latest YOUR_AWS_ACCOUNT.dkr.ecr.YOUR_REGION.amazonaws.com/car_price_prediction:latest
docker push YOUR_AWS_ACCOUNT.dkr.ecr.YOUR_REGION.amazonaws.com/car_price_prediction:latest
```

#### Google Cloud Run
```bash
docker build -t gcr.io/YOUR_PROJECT_ID/car_price_prediction:latest .
docker push gcr.io/YOUR_PROJECT_ID/car_price_prediction:latest
gcloud run deploy car-price-prediction --image gcr.io/YOUR_PROJECT_ID/car_price_prediction:latest --platform managed
```

#### Docker Hub
```bash
docker build -t YOUR_USERNAME/car_price_prediction:latest .
docker push YOUR_USERNAME/car_price_prediction:latest
```

#### Render.com (Free Tier)
1. Push your project to GitHub.
2. Create a new Web Service in Render and connect your GitHub repository.
3. Choose "Docker" for the environment.
4. Set the start command to:
```bash
uvicorn app:app --host 0.0.0.0 --port $PORT
```
5. Render automatically sets the `PORT` environment variable, and the Dockerfile now uses it.
6. You can use the included `render.yaml` manifest to auto-deploy your service.

```yaml
services:
  - type: web
    name: car-price-prediction
    env: docker
    dockerfilePath: Dockerfile
    plan: free
    region: oregon
    autoDeploy: true
    healthCheckPath: /health
```

Render free tier notes:
- Free services sleep after inactivity.
- Public GitHub repo is required for free plan auto-deploy.
- The app must listen on the Render-provided `$PORT`.

## Troubleshooting

### Port already in use
```bash
docker-compose down
docker ps
```

### Out of memory
Increase Docker's memory limit in Docker Desktop settings.

### Model file not found
Ensure the `model/car_price_model.pkl` file exists before running the container.

### Rebuild with no cache
```bash
docker-compose up -d --build --no-cache
```
