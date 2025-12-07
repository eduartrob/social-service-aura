#!/bin/sh
set -e

echo "🚀 Starting Social Service..."
echo "─────────────────────────────────────────────"

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
max_retries=30
retry_count=0

while ! pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} > /dev/null 2>&1; do
  retry_count=$((retry_count + 1))
  if [ $retry_count -ge $max_retries ]; then
    echo "❌ PostgreSQL is not available after $max_retries attempts"
    exit 1
  fi
  echo "   Attempt $retry_count/$max_retries - waiting..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run migrations automatically on startup
echo "📦 Running database migrations..."
if npm run migrate:up; then
  echo "✅ Database migrations completed successfully"
else
  echo "⚠️  Migrations may have already been applied or encountered an error"
fi

echo "─────────────────────────────────────────────"
echo "🚀 Starting Social Service on port ${PORT:-3002}"

# Execute the main command
exec "$@"
