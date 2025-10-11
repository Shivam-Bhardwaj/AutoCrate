#!/bin/bash
# AutoCrate Deployment Script
# Automatically bumps version and deploys to Vercel

set -e  # Exit on error

echo "🚀 AutoCrate Deployment Script"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Run this script from the project root."
  exit 1
fi

# Determine version bump type (default to patch)
BUMP_TYPE=${1:-patch}

if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo "❌ Error: Invalid version bump type. Use: patch, minor, or major"
  exit 1
fi

echo "📦 Current version: $(node -p "require('./package.json').version")"
echo "🔢 Bumping $BUMP_TYPE version..."
echo ""

# Bump version
npm run version:$BUMP_TYPE

# Sync version across all files
npm run version:sync

NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ New version: $NEW_VERSION"
echo ""

# Stage version changes
git add package.json package-lock.json

# Check if there are other changes to commit
if [ -n "$(git diff --cached --name-only | grep -v 'package')" ]; then
  echo "📝 Committing all staged changes with version bump..."
  git commit -m "chore: Bump version to $NEW_VERSION

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
else
  echo "📝 Committing version bump..."
  git commit -m "chore: Bump version to $NEW_VERSION

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to Vercel
if [ -z "$VERCEL_TOKEN" ]; then
  echo "⚠️  VERCEL_TOKEN not set in environment. Attempting to use token from .bashrc..."
  source ~/.bashrc
fi

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Error: VERCEL_TOKEN is not set. Cannot deploy."
  exit 1
fi

vercel --token "$VERCEL_TOKEN" --prod --yes

echo ""
echo "✅ Deployment complete!"
echo "📦 Version: $NEW_VERSION"
echo "🌐 Check your production URL above"
echo ""
