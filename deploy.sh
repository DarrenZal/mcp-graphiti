#!/bin/bash
set -e

# Script to commit and push changes to the gh-pages branch

echo "Deploying changes to GitHub Pages..."

# Add all changes
git add .

# Commit changes
git commit -m "Hide Episodic and Unknown node types by default and fix filtering functionality"

# Push to GitHub
git push origin gh-pages

echo "Deployment complete! The changes should be live on GitHub Pages shortly."
