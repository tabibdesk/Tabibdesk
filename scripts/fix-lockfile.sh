#!/bin/bash
set -e

# Remove the out-of-sync lockfile
rm -f package-lock.json

# Generate a fresh lockfile with npm install
npm install --legacy-peer-deps

echo "✓ Lockfile regenerated successfully"
