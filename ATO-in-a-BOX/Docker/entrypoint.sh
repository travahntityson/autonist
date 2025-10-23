#!/bin/sh

# 1. Wait for PostgreSQL Service (from your original file)
echo "Waiting for database-service..."
while ! nc -z database-service 5432; do
  sleep 0.5
done
echo "Database service started and ready."

# 2. ADDED: Wait for the new AI Service
echo "Waiting for ai-service..."
while ! nc -z ai-service 11434; do
  sleep 0.5
done
echo "AI service (Ollama) started and ready."

# 3. Run Database Seeding (from your original file)
echo "Seeding/Migrating database..."
node scripts/seed_database.js

# 4. Start the main application server (from your original file)
echo "Starting Node.js server with FIPS mode..."
# 'exec node server.js' will automatically pick up
# the NODE_OPTIONS=--fips-mode=1 from docker-compose.yml
exec node server.js