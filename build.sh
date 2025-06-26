#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Building frontend ---"
cd frontend
npm install --legacy-peer-deps
npm run build
