# Collaborative Task Management Monorepo

This repository contains a monorepo for a collaborative task management system with:

- `backend/` — Django + Django REST Framework API
- `frontend/` — React.js application powered by Vite
- PostgreSQL database support via Docker Compose

## Folder structure

- `backend/`
  - `manage.py`
  - `requirements.txt`
  - `taskmanager/` Django project
  - `core/` application code
- `frontend/`
  - `package.json`
  - `vite.config.js`
  - `src/` React source files

## Run with Docker Compose

Make sure Docker is installed, then run:

```powershell
docker compose up --build
```

The services will be available at:

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

## Backend configuration

The backend is configured to use PostgreSQL when the following environment variables are provided:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_PORT`

## Useful commands

```powershell
# Start the full stack
docker compose up --build

# Stop services
docker compose down
```

## Notes

- The backend uses `psycopg2-binary` for PostgreSQL connectivity.
- The frontend is a Vite-powered React application.
