#!/bin/bash
set -e

echo "🚀 Deploying Super Pi Production Stack..."

# Pull latest images
docker compose pull

# Create volumes if needed
docker volume create postgres_data
docker volume create blockchain-data

# Start with health checks
docker compose up -d --scale wallet=2

# Wait for health
sleep 30

# Run migrations
docker compose exec -T api npm run migrate

# Preload exchange database
docker compose exec purity-node npm run preload-exchanges

echo "✅ Super Pi Deployed! 🌟"
echo "Wallet: http://localhost:3000"
echo "Explorer: http://localhost:3004"
echo "API: http://localhost:3002"
