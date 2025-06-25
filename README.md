# Miami School Bus Service - Local Development Setup

This guide will help you run the Miami School Bus Service application locally using Docker Compose.

## Prerequisites

- Docker Desktop installed on your machine
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Clone or download the project files**
   Make sure you have all the project files in a directory structure like this:
   ```
   miami-bus-service/
   ├── docker-compose.yml
   ├── init.sql
   ├── bus-backend/
   │   ├── Dockerfile
   │   ├── requirements.txt
   │   └── src/
   │       ├── main.py
   │       ├── config.py
   │       ├── models/
   │       ├── routes/
   │       └── static/ (contains built frontend files)
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Open your browser and go to: http://localhost:5000
   - The application will be available on port 5000

4. **Stop the application**
   ```bash
   docker-compose down
   ```

## Services

The Docker Compose setup includes:

- **PostgreSQL Database** (port 5432)
  - Database: `bus_service`
  - Username: `bus_user`
  - Password: `bus_password`

- **Flask Backend** (port 5000)
  - Serves both API endpoints and the frontend
  - Automatically creates database tables on first run

## Demo Accounts

Once the application is running, you can use these demo accounts:

- **Admin:** admin@demo.com / password123
- **Driver:** driver@demo.com / password123
- **Parent:** parent@demo.com / password123

## Development

### Making Changes

1. **Backend Changes:**
   - Edit files in the `bus-backend/` directory
   - Restart the backend service: `docker-compose restart backend`

2. **Frontend Changes:**
   - The frontend is built and included in the backend container
   - To update frontend, rebuild the entire backend: `docker-compose up --build backend`

### Database

- Database data is persisted in a Docker volume
- To reset the database: `docker-compose down -v` (this will delete all data)

### Logs

View application logs:
```bash
# All services
docker-compose logs

# Backend only
docker-compose logs backend

# Database only
docker-compose logs db
```

## Troubleshooting

1. **Port conflicts:**
   - If port 5000 or 5432 are already in use, edit the `docker-compose.yml` file to use different ports

2. **Database connection issues:**
   - Wait a few seconds for the database to fully start before the backend connects
   - Check logs: `docker-compose logs db`

3. **Frontend not loading:**
   - Ensure the frontend files are built and copied to `bus-backend/src/static/`
   - Rebuild the backend: `docker-compose up --build backend`

## Production Deployment

For production deployment:

1. Change the secret keys in the environment variables
2. Use a production-grade database setup
3. Configure proper CORS origins
4. Set up SSL/HTTPS
5. Use a production WSGI server like Gunicorn

## Support

If you encounter any issues, please check the logs and ensure all files are in the correct locations as shown in the directory structure above.

