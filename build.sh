#!/bin/bash
# This script builds the backend and frontend for production.
# Exit immediately if a command exits with a non-zero status.
set -e

# --- Build Backend ---
echo "--- Installing backend dependencies ---"
cd backend
npm install

# --- Build Frontend ---
echo "--- Installing and building frontend ---"
cd ../frontend
npm install --legacy-peer-deps
npm run build

