#!/bin/bash
set -e

echo "=== Running Automated Tests ==="
node src/utils/test.js

echo "=== Cleaning Build Cache ==="
rm -rf .next out

echo "=== Building Static Production Bundle ==="
npm run build

echo "=== Static Build Validation Successful ==="
echo "Build folder output size:"
du -sh out
