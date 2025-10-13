#!/bin/bash
# AutoCrate RPi5 Setup Script
# Armbian/Debian ARM64 Quick Setup

set -e

echo "========================================="
echo "AutoCrate RPi5 Setup Script"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running on ARM64
ARCH=$(uname -m)
if [[ "$ARCH" != "aarch64" && "$ARCH" != "arm64" ]]; then
    echo -e "${YELLOW}Warning: Not running on ARM64 architecture (detected: $ARCH)${NC}"
    echo -e "${YELLOW}This script is optimized for RPi5. Continue? (y/n)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Architecture: $ARCH"
echo ""

# Step 1: Check Node.js
echo "Step 1: Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js already installed: $NODE_VERSION"
else
    echo -e "${YELLOW}→${NC} Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo -e "${GREEN}✓${NC} Node.js installed: $(node --version)"
fi
echo ""

# Step 2: Install essential tools
echo "Step 2: Installing essential tools..."
sudo apt-get update -qq
sudo apt-get install -y git build-essential -qq
echo -e "${GREEN}✓${NC} Essential tools installed"
echo ""

# Step 3: Git configuration
echo "Step 3: Configuring Git..."
git config --global user.name "Shivam-Bhardwaj" 2>/dev/null || true
git config --global user.email "curious.antimony@gmail.com" 2>/dev/null || true
git config --global credential.helper store 2>/dev/null || true
echo -e "${GREEN}✓${NC} Git configured"
echo ""

# Step 4: GitHub credentials
echo "Step 4: Setting up GitHub credentials..."
if [ -f ~/.git-credentials ]; then
    echo -e "${YELLOW}→${NC} GitHub credentials already exist"
else
    echo -e "${YELLOW}→${NC} Please set up GitHub token manually:"
    echo "  echo \"https://Shivam-Bhardwaj:YOUR_GITHUB_TOKEN@github.com\" > ~/.git-credentials"
    echo "  chmod 600 ~/.git-credentials"
fi
echo ""

# Step 5: Optimize npm for ARM
echo "Step 5: Optimizing npm for ARM64..."
npm config set maxsockets 5
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
echo -e "${GREEN}✓${NC} npm optimized"
echo ""

# Step 6: Install dependencies
echo "Step 6: Installing project dependencies..."
echo -e "${YELLOW}→${NC} This may take 10-15 minutes on first run..."
export NODE_OPTIONS="--max-old-space-size=2048"

npm install

echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Step 7: Verify installation
echo "Step 7: Verifying installation..."
echo -e "${YELLOW}→${NC} Running type check..."
npm run type-check

echo -e "${GREEN}✓${NC} TypeScript compilation successful"
echo ""

# Step 8: Install Vercel CLI
echo "Step 8: Installing Vercel CLI..."
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✓${NC} Vercel CLI already installed"
else
    npm install -g vercel
    echo -e "${GREEN}✓${NC} Vercel CLI installed"
fi

echo -e "${YELLOW}→${NC} Configure Vercel token manually if needed:"
echo "  export VERCEL_TOKEN=YOUR_VERCEL_TOKEN"
echo "  echo \"export VERCEL_TOKEN=YOUR_VERCEL_TOKEN\" >> ~/.bashrc"
echo ""

# Final summary
echo "========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "========================================="
echo ""
echo "Quick start commands:"
echo ""
echo "  npm run dev              # Start development server"
echo "  npm run build            # Production build"
echo "  npm test                 # Run tests"
echo "  npm run deploy           # Deploy new version"
echo ""
echo "Development server will be available at:"
echo "  - http://localhost:3000"
echo "  - http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "To start developing:"
echo "  npm run dev"
echo ""
