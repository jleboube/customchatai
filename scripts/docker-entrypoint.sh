#!/bin/sh
set -e

echo "Starting CustomChatAI..."

# Generate secrets if not provided
if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "Generating NEXTAUTH_SECRET..."
  export NEXTAUTH_SECRET=$(openssl rand -base64 32)
fi

# Set default values for required variables
export NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
export LLM_API_BASE_URL=${LLM_API_BASE_URL:-http://model-runner:11434/v1}
export RATE_LIMIT_REQUESTS=${RATE_LIMIT_REQUESTS:-100}
export RATE_LIMIT_WINDOW=${RATE_LIMIT_WINDOW:-60000}

# Set empty defaults for optional OAuth variables
export GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-}
export GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}
export GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID:-}
export GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET:-}

echo "Environment configured:"
echo "  - NEXTAUTH_URL: $NEXTAUTH_URL"
echo "  - LLM_API_BASE_URL: $LLM_API_BASE_URL"
echo "  - NEXTAUTH_SECRET: [hidden - $(echo -n $NEXTAUTH_SECRET | wc -c) chars]"
echo "  - DATABASE_URL: [hidden]"
if [ -n "$GOOGLE_CLIENT_ID" ]; then
  echo "  - Google OAuth: Enabled"
else
  echo "  - Google OAuth: Disabled"
fi
if [ -n "$GITHUB_CLIENT_ID" ]; then
  echo "  - GitHub OAuth: Enabled"
else
  echo "  - GitHub OAuth: Disabled"
fi

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting Next.js server..."
exec "$@"
