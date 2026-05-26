@echo off
REM Build and run script for Car Price Prediction Docker application

echo.
echo ================================
echo Car Price Prediction - Docker
echo ================================
echo.

REM Check Docker installation
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check Docker Compose installation
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo Docker and Docker Compose are installed
echo.

REM Menu
echo Select an option:
echo 1. Build and start (development)
echo 2. Start (development)
echo 3. Build and start (production with Nginx)
echo 4. Stop containers
echo 5. View logs
echo 6. Clean up (remove containers and images)
echo 7. Push to DockerHub
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" (
    echo Building and starting development environment...
    docker-compose up -d --build
    echo Development environment started
    echo Access the application at: http://localhost:8000
) else if "%choice%"=="2" (
    echo Starting development environment...
    docker-compose up -d
    echo Development environment started
    echo Access the application at: http://localhost:8000
) else if "%choice%"=="3" (
    echo Building and starting production environment...
    docker-compose -f docker-compose.prod.yml up -d --build
    echo Production environment started
    echo Access the application at: http://localhost
) else if "%choice%"=="4" (
    echo Stopping containers...
    docker-compose down
    echo Containers stopped
) else if "%choice%"=="5" (
    echo Fetching logs...
    docker-compose logs -f
) else if "%choice%"=="6" (
    set /p confirm="Are you sure you want to remove all containers and images? (y/N): "
    if /i "%confirm%"=="y" (
        echo Removing containers and images...
        docker-compose down -v
        docker rmi car_price_prediction:latest 2>nul
        echo Cleanup complete
    ) else (
        echo Cleanup cancelled
    )
) else if "%choice%"=="7" (
    set /p username="Enter your DockerHub username: "
    set /p repo="Enter repository name (default: car_price_prediction): "
    if "%repo%"=="" set repo=car_price_prediction
    
    echo Building image...
    docker build -t %username%/%repo%:latest .
    
    echo Pushing to DockerHub...
    docker push %username%/%repo%:latest
    
    echo Image pushed to DockerHub
    echo Repository: %username%/%repo%:latest
) else (
    echo Invalid choice
    exit /b 1
)

echo.
