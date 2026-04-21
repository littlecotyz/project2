#!/bin/bash
set -e

echo "Starting Django application with Channels..."

# Wait for database to be ready (if using PostgreSQL)
if [ -n "$POSTGRES_HOST" ]; then
    echo "Waiting for PostgreSQL at $POSTGRES_HOST:${POSTGRES_PORT:-5432}..."
    max_attempts=30
    attempt=0
    until python -c "import psycopg2; psycopg2.connect(host='$POSTGRES_HOST', database='$POSTGRES_DB', user='$POSTGRES_USER', password='$POSTGRES_PASSWORD')" 2>/dev/null || [ $attempt -eq $max_attempts ]; do
        echo "PostgreSQL is unavailable (attempt $((attempt+1))/$max_attempts) - sleeping"
        sleep 1
        attempt=$((attempt+1))
    done
    if [ $attempt -eq $max_attempts ]; then
        echo "Could not connect to PostgreSQL after $max_attempts attempts"
        exit 1
    fi
    echo "PostgreSQL is up - continuing"
fi

# Run database migrations
echo "Running database migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Collect static files (optional, usually handled by Nginx in production)
echo "Collecting static files..."
python manage.py collectstatic --noinput || true

# Start Daphne server
echo "Starting Daphne server on 0.0.0.0:8000..."
exec daphne -b 0.0.0.0 -p 8000 taskmanager.asgi:application
