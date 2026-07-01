#!/bin/bash

set -e

echo "Starting 7-deployment generation script..."

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Error: Please switch to main branch before running this script."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Error: You have unstaged or uncommitted changes. Please commit or stash them first."
  exit 1
fi

for i in {1..7}
do
  BRANCH_NAME="deploy-$i"
  echo "----------------------------------------"
  echo "Processing branch: $BRANCH_NAME"
  
  if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    git checkout "$BRANCH_NAME"
    git merge main --no-edit
  else
    git checkout -b "$BRANCH_NAME"
  fi
  
  echo "NEXT_PUBLIC_DEPLOY_ID=$i" > .env.production
  
  git add -f .env.production
  git commit -m "deploy: configure deployment id #$i" || echo "No changes to commit for $BRANCH_NAME"
  
  echo "Pushing $BRANCH_NAME to origin..."
  git push origin "$BRANCH_NAME"
done

echo "----------------------------------------"
echo "All 7 deployments successfully processed!"
echo "Returning to main branch..."
git checkout main
