#!/bin/bash
# A more robust build script for Render.
# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Building backend dependencies ---"
cd backend
npm install
cd ..

echo "--- Building frontend ---"
cd frontend
npm install --legacy-peer-deps
npm run build
