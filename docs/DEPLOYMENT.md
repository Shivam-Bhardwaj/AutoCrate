# AutoCrate Deployment Guide

## Overview

AutoCrate is deployed using Vercel for hosting and GitHub Actions for CI/CD. This guide covers the complete deployment process.

## Prerequisites

- Node.js 18+ and npm
- Git installed and configured
- GitHub account
- Vercel account (free tier works)
- GitHub CLI (optional but recommended)

## Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/Shivam-Bhardwaj/AutoCrate.git
cd AutoCrate
npm install

# 2. Run tests
npm run test:all

# 3. Build locally
npm run build

# 4. Deploy to Vercel
npm run deploy
```

## Detailed Deployment Steps

### 1. Initial Setup

#### Install Dependencies
```bash
npm install
npm run prepare  # Setup git hooks
```

#### Configure Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_APP_NAME=AutoCrate
NEXT_PUBLIC_APP_VERSION=2.1.0
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. GitHub Repository Setup

#### Automatic Setup (Recommended)
```bash
chmod +x setup-github.sh
./setup-github.sh
```

#### Manual Setup
```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/Shivam-Bhardwaj/AutoCrate.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Vercel Deployment

#### First-Time Setup

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy: Yes
   - Scope: Your account
   - Link to existing project: No (first time)
   - Project name: autocrate
   - Directory: ./
   - Override settings: No

4. **Production Deployment**
   ```bash
   vercel --prod
   ```

#### Subsequent Deployments

```bash
# Preview deployment
npm run deploy:preview

# Production deployment
npm run deploy

# Build and deploy
npm run deploy:build
```

### 4. GitHub Actions CI/CD Setup

#### Required Secrets

Add these secrets in GitHub repository settings:

1. Go to: `Settings → Secrets and variables → Actions`
2. Add the following secrets:

| Secret Name | How to Get It |
|------------|---------------|
| `VERCEL_TOKEN` | [Vercel Dashboard → Account → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Run `vercel info` in project root |
| `VERCEL_PROJECT_ID` | Run `vercel info` in project root |
| `CODECOV_TOKEN` | (Optional) From [codecov.io](https://codecov.io) |

#### Workflow Files

The CI/CD pipeline is configured in `.github/workflows/ci.yml` and includes:

- **Linting & Formatting**: ESLint, Prettier, TypeScript checks
- **Testing**: Unit, Integration, E2E tests with coverage
- **Consistency Checks**: Accessibility, Security, Design system
- **Build Verification**: Production build test
- **Deployment**: Automatic deployment on push to main

### 5. Environment Configuration

#### Development
```bash
# .env.local
NEXT_PUBLIC_APP_NAME=AutoCrate Dev
NEXT_PUBLIC_APP_VERSION=dev
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Production (Vercel)
Set in Vercel Dashboard → Project Settings → Environment Variables:

```env
NEXT_PUBLIC_APP_NAME=AutoCrate
NEXT_PUBLIC_APP_VERSION=2.1.0
NEXT_PUBLIC_API_URL=$VERCEL_URL
NODE_ENV=production
```

### 6. Domain Configuration

#### Custom Domain Setup

1. **In Vercel Dashboard**:
   - Go to Project → Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **DNS Settings** (example for autocrate.com):
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

3. **SSL Certificate**: Automatically provisioned by Vercel

### 7. Monitoring & Analytics

#### Vercel Analytics
Automatically included, view in Vercel dashboard

#### Error Tracking (Optional)
Add Sentry for error tracking:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

#### Performance Monitoring
- Lighthouse CI in GitHub Actions
- Web Vitals in Vercel Analytics
- Custom metrics with Google Analytics

### 8. Deployment Checklist

Before deploying to production:

#### Core Requirements
- [ ] Run all tests: `npm run test:all`
- [ ] Check code quality: `npm run check:all`
- [ ] Run consistency checkers: `./autocrate.sh` (option 8)
- [ ] Update version in `package.json`
- [ ] Update CHANGELOG.md
- [ ] Test mobile responsiveness
- [ ] Verify environment variables
- [ ] Check security headers
- [ ] Test in multiple browsers
- [ ] Validate accessibility

#### Typography Enhancement Requirements
- [ ] Verify font loading performance (no FOUT)
- [ ] Test 3D label readability in both light/dark themes
- [ ] Validate contrast ratios meet WCAG AA standards
- [ ] Check fluid typography scaling across viewports
- [ ] Test variable font loading and fallbacks
- [ ] Verify canvas stroke rendering for 3D labels
- [ ] Check build size delta (< +30KB gzip ideal)
- [ ] Validate semantic token implementation

#### AMAT Compliance Features
- [ ] Test AMAT style auto-detection
- [ ] Verify material validation system
- [ ] Check ISPM-15 compliance for international shipping
- [ ] Test MBB (Moisture Barrier Bag) calculations
- [ ] Validate weight calculation accuracy
- [ ] Test air shipment optimization
- [ ] Verify chamfered panel 3D rendering
- [ ] Check material specifications database

#### Performance Testing
- [ ] Test with large crate configurations
- [ ] Verify 3D viewer performance
- [ ] Check weight calculation performance
- [ ] Test real-time updates
- [ ] Validate memory usage

#### Typography Enhancement Post-Deployment
- [ ] Verify production font loading (no FOUT)
- [ ] Spot check accessibility with axe in production
- [ ] Test 3D label visibility in production environment
- [ ] Validate fluid typography across different devices
- [ ] Check contrast ratios in production
- [ ] Monitor font loading performance metrics
- [ ] Record metrics and update CHANGELOG with deployment date

### 9. Rollback Procedures

#### Vercel Rollback
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]

# Or use Vercel dashboard for visual rollback
```

#### Git Rollback
```bash
# Revert last commit
git revert HEAD
git push

# Reset to specific commit
git reset --hard [commit-hash]
git push --force
```

### 10. Troubleshooting

#### Build Failures

1. **Clear cache**:
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Check Node version**:
   ```bash
   node --version  # Should be 18+
   ```

3. **Verify environment variables**:
   ```bash
   vercel env pull
   ```

#### Deployment Issues

1. **Vercel CLI issues**:
   ```bash
   vercel logout
   vercel login
   vercel --force
   ```

2. **GitHub Actions failures**:
   - Check secrets are correctly set
   - Review workflow logs
   - Verify branch protection rules

#### Performance Issues

1. **Bundle size**:
   ```bash
   npm run analyze
   ```

2. **Lighthouse audit**:
   ```bash
   npm run lighthouse
   ```

3. **AMAT compliance performance**:
   ```bash
   # Test weight calculations
   npm run test:unit -- --grep "weight"
   
   # Test material validation
   npm run test:unit -- --grep "material"
   
   # Test ISPM-15 validation
   npm run test:unit -- --grep "ispm"
   ```

#### AMAT Feature Issues

1. **Material validation failures**:
   - Check material specifications database
   - Verify validation rules
   - Review compliance scoring logic

2. **Weight calculation errors**:
   - Verify material densities
   - Check dimensional calculations
   - Validate hardware specifications

3. **ISPM-15 compliance issues**:
   - Verify country-specific requirements
   - Check treatment parameters
   - Validate documentation requirements

### 11. Security Considerations

#### Headers Configuration
Security headers are configured in `vercel.json`:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

#### Environment Variables
- Never commit `.env.local`
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Store sensitive data in Vercel environment variables

#### Dependency Updates
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### 12. Scaling Considerations

#### Performance Optimization
- Image optimization with Next.js Image
- Code splitting and lazy loading
- API route caching
- Static generation where possible

#### Traffic Handling
- Vercel automatically scales
- Consider rate limiting for API routes
- Implement caching strategies
- Use CDN for static assets

#### AMAT Compliance Scaling
- Material database is cached and optimized
- Weight calculations are memoized
- Validation results are cached
- Country requirements are pre-loaded

### 13. AMAT Compliance Deployment

#### Environment Variables for AMAT Features

Add these to your Vercel environment variables:

```env
# AMAT Compliance Settings
NEXT_PUBLIC_AMAT_COMPLIANCE_ENABLED=true
NEXT_PUBLIC_MATERIAL_DATABASE_URL=/api/materials
NEXT_PUBLIC_ISPM15_VALIDATION_ENABLED=true

# Performance Settings
NEXT_PUBLIC_WEIGHT_CACHE_TTL=3600
NEXT_PUBLIC_VALIDATION_CACHE_TTL=1800
```

#### Material Database Setup

The AMAT compliance system includes a comprehensive material database that is automatically deployed:

1. **Wood Specifications**: Pre-loaded with AMAT-approved wood grades
2. **Hardware Database**: Complete hardware specifications
3. **Treatment Standards**: ISPM-15 and other treatment standards
4. **Country Requirements**: Pre-loaded country-specific requirements

#### Compliance Validation

The system automatically validates compliance during deployment:

1. **Material Validation**: All materials validated against standards
2. **ISPM-15 Compliance**: International shipping requirements checked
3. **Weight Calculations**: Accurate weight calculations verified
4. **Documentation**: Required documentation generated

#### Monitoring AMAT Features

Set up monitoring for AMAT compliance features:

```bash
# Check compliance validation performance
npm run test:performance -- --grep "compliance"

# Monitor material validation
npm run test:performance -- --grep "material"

# Check ISPM-15 validation
npm run test:performance -- --grep "ispm"
```

#### Troubleshooting AMAT Deployment

1. **Material validation timeouts**:
   - Increase validation cache TTL
   - Optimize database queries
   - Implement pagination for large datasets

2. **Weight calculation errors**:
   - Verify material density database
   - Check dimensional calculation logic
   - Validate hardware specifications

3. **ISPM-15 compliance failures**:
   - Verify country-specific requirements
   - Check treatment parameter validation
   - Review documentation requirements

## Support

For deployment issues:
1. Check [Vercel Status](https://www.vercel-status.com/)
2. Review [GitHub Actions logs](https://github.com/Shivam-Bhardwaj/AutoCrate/actions)
3. Open an issue on [GitHub](https://github.com/Shivam-Bhardwaj/AutoCrate/issues)
4. Contact support team

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [AutoCrate README](../README.md)