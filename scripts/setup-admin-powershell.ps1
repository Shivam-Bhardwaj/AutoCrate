# AutoCrate Project - Admin PowerShell Setup Script
# This script sets up admin PowerShell for the AutoCrate project

Write-Host "🚀 Setting up Admin PowerShell for AutoCrate Project..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green

# Navigate to project directory
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath
Write-Host "📁 Project Directory: $projectPath" -ForegroundColor Cyan

# Install Vercel CLI if not already installed
Write-Host "🔧 Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Vercel CLI already installed: $vercelVersion" -ForegroundColor Green
    } else {
        throw "Vercel not found"
    }
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Vercel CLI installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
}

# Setup Vercel
Write-Host "🔐 Setting up Vercel..." -ForegroundColor Yellow
Write-Host "This will open your browser for authentication..." -ForegroundColor Cyan

# Login to Vercel
vercel login
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Vercel login successful" -ForegroundColor Green
} else {
    Write-Host "❌ Vercel login failed" -ForegroundColor Red
    exit 1
}

# Link project
Write-Host "🔗 Linking project to Vercel..." -ForegroundColor Yellow
vercel link
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Project linked successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Project linking failed" -ForegroundColor Red
    exit 1
}

# Add custom domain
Write-Host "🌐 Adding custom domain: autocrate.shivambhardwaj.com" -ForegroundColor Yellow
vercel domains add autocrate.shivambhardwaj.com
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Custom domain added successfully" -ForegroundColor Green
    Write-Host "📋 Please add the DNS records to your Cloudflare account" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to add custom domain" -ForegroundColor Red
}

Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host "Your app will be available at:" -ForegroundColor Cyan
Write-Host "  • https://autocrate.vercel.app" -ForegroundColor White
Write-Host "  • https://autocrate.shivambhardwaj.com" -ForegroundColor White

pause
