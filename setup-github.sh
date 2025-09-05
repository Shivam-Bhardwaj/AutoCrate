#!/bin/bash

# AutoCrate GitHub Repository Setup Script
# This script initializes and pushes the project to GitHub

set -e

echo "================================================"
echo "       AutoCrate GitHub Repository Setup        "
echo "================================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: Git is not installed. Please install Git first."
    exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Warning: GitHub CLI (gh) is not installed."
    echo "You can install it from: https://cli.github.com/"
    echo "Continuing with basic git setup..."
    USE_GH=false
else
    USE_GH=true
fi

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "Initializing Git repository..."
    git init
    echo "Git repository initialized."
else
    echo "Git repository already initialized."
fi

# Add all files
echo "Adding files to Git..."
git add .

# Create initial commit if no commits exist
if ! git rev-parse HEAD &> /dev/null 2>&1; then
    echo "Creating initial commit..."
    git commit -m "Initial commit: AutoCrate v2.1.0 with mobile-first design and comprehensive testing"
else
    echo "Repository already has commits."
fi

# Setup GitHub repository
REPO_NAME="AutoCrate"
GITHUB_USER="Shivam-Bhardwaj"
REPO_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo ""
echo "GitHub Repository Configuration:"
echo "Repository: $REPO_URL"
echo ""

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "Remote 'origin' already exists."
    read -p "Do you want to update the remote URL? (y/n): " update_remote
    if [ "$update_remote" = "y" ]; then
        git remote set-url origin $REPO_URL
        echo "Remote URL updated."
    fi
else
    echo "Adding remote origin..."
    git remote add origin $REPO_URL
    echo "Remote origin added."
fi

# Create repository on GitHub if using gh CLI
if [ "$USE_GH" = true ]; then
    echo ""
    read -p "Do you want to create the repository on GitHub? (y/n): " create_repo
    if [ "$create_repo" = "y" ]; then
        echo "Creating GitHub repository..."
        gh repo create $REPO_NAME \
            --public \
            --description "Professional shipping crate design and NX CAD expression generator with mobile-first UI" \
            --homepage "https://autocrate.vercel.app" \
            --source=. \
            --remote=origin \
            --push
        
        echo "Repository created and pushed to GitHub!"
        
        # Set repository topics
        echo "Setting repository topics..."
        gh repo edit $GITHUB_USER/$REPO_NAME \
            --add-topic "nextjs" \
            --add-topic "react" \
            --add-topic "typescript" \
            --add-topic "threejs" \
            --add-topic "cad" \
            --add-topic "nx-siemens" \
            --add-topic "mobile-first" \
            --add-topic "pwa"
        
        # Enable features
        echo "Configuring repository settings..."
        gh repo edit $GITHUB_USER/$REPO_NAME \
            --enable-issues \
            --enable-wiki \
            --enable-projects
        
        echo "Repository configuration complete!"
    fi
fi

# Push to GitHub
echo ""
read -p "Do you want to push to GitHub now? (y/n): " push_now
if [ "$push_now" = "y" ]; then
    echo "Pushing to GitHub..."
    
    # Set upstream and push
    if git branch --show-current | grep -q "main"; then
        git push -u origin main
    elif git branch --show-current | grep -q "master"; then
        # Rename master to main
        echo "Renaming branch from master to main..."
        git branch -M main
        git push -u origin main
    else
        current_branch=$(git branch --show-current)
        echo "Pushing current branch: $current_branch"
        git push -u origin $current_branch
    fi
    
    echo "Successfully pushed to GitHub!"
fi

# Setup GitHub Actions secrets reminder
echo ""
echo "================================================"
echo "           GitHub Actions Setup Required        "
echo "================================================"
echo ""
echo "To enable CI/CD, add these secrets in GitHub:"
echo "  1. Go to: https://github.com/$GITHUB_USER/$REPO_NAME/settings/secrets/actions"
echo "  2. Add the following secrets:"
echo "     - VERCEL_TOKEN        (from https://vercel.com/account/tokens)"
echo "     - VERCEL_ORG_ID       (from .vercel/project.json)"
echo "     - VERCEL_PROJECT_ID   (from .vercel/project.json)"
echo "     - CODECOV_TOKEN       (optional, from https://codecov.io)"
echo ""
echo "================================================"
echo ""

# Create .vercel directory if it doesn't exist
if [ ! -d .vercel ]; then
    echo "Creating .vercel directory for deployment configuration..."
    mkdir -p .vercel
    echo '{
  "orgId": "YOUR_VERCEL_ORG_ID",
  "projectId": "YOUR_VERCEL_PROJECT_ID"
}' > .vercel/project.json
    echo ".vercel directory created. Update with your Vercel project details."
fi

# Final instructions
echo "Setup complete! Next steps:"
echo "  1. Update .vercel/project.json with your Vercel project details"
echo "  2. Add GitHub Actions secrets (see above)"
echo "  3. Run 'npm run deploy' to deploy to Vercel"
echo "  4. Visit https://github.com/$GITHUB_USER/$REPO_NAME to view your repository"
echo ""
echo "Happy coding! 🚀"