#!/bin/sh
set -e

# Generate NEXTAUTH_SECRET if not provided
if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "Generating NEXTAUTH_SECRET..."
  export NEXTAUTH_SECRET=$(openssl rand -base64 32)
  echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" >> /app/.env.runtime
fi

# Generate database password if not provided
if [ -z "$POSTGRES_PASSWORD" ]; then
  echo "Generating POSTGRES_PASSWORD..."
  export POSTGRES_PASSWORD=$(openssl rand -base64 24)
  echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" >> /app/.env.runtime
fi

# Update DATABASE_URL with generated password if needed
if [ -n "$POSTGRES_PASSWORD" ] && [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://chatuser:${POSTGRES_PASSWORD}@db:5432/customchatai"
  echo "DATABASE_URL=$DATABASE_URL" >> /app/.env.runtime
fi

# Set default values for optional OAuth variables
export GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-}
export GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}
export GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID:-}
export GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET:-}

# Set default URLs
export NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
export LLM_API_BASE_URL=${LLM_API_BASE_URL:-http://model-runner:11434/v1}

# Set default rate limiting
export RATE_LIMIT_REQUESTS=${RATE_LIMIT_REQUESTS:-100}
export RATE_LIMIT_WINDOW=${RATE_LIMIT_WINDOW:-60000}

echo "Secrets generated and environment configured!"
