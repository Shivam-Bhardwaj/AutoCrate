# 🚀 AutoCrate Deployment Guide

## Dual Platform Deployment Setup

AutoCrate is configured for dual deployment on both **Vercel** and **Replit** platforms, giving you flexibility and redundancy for your professional crate design application.

## 🎯 Quick Deployment Commands

### Vercel Deployment
```bash
# Production deployment to Vercel (client-approved domain)
npm run deploy:vercel

# Preview deployment to Vercel
npm run deploy:preview

# Manual Vercel deployment
vercel --prod
```

### Replit Deployment  
```bash
# Replit deploys automatically when you push to main branch
npm run deploy:replit  # (informational command)

# Test Replit production build locally
npm run start:replit
```

### Dual Deployment
```bash
# Deploy to both platforms simultaneously
npm run deploy:dual
```

## 🌐 Platform Configurations

### Vercel Configuration
- **Config File**: `vercel.json`
- **Domain**: Client-approved custom domain
- **Build Command**: `npm run build` (with SWC fallback)
- **Environment**: Production optimized with WebAssembly SWC
- **Auto-scaling**: Built-in Vercel edge network

### Replit Configuration  
- **Config**: Built into `replit.toml` and deployment settings
- **Domain**: `your-app-name.your-username.repl.co`
- **Build Command**: Automatic on deployment
- **Environment**: Container-based with polling for file watching
- **Scaling**: Autoscale deployment type

## 🔧 Environment Variables

### Required for Both Platforms
```bash
NEXT_SWC_DISABLE_NATIVE=1  # Forces WebAssembly SWC (critical)
```

### Platform-Specific Variables
```bash
# Replit (automatically set)
PORT=5000
HOSTNAME=0.0.0.0

# Vercel (automatically managed)
VERCEL=1
VERCEL_URL=your-domain.vercel.app
```

## 📋 Pre-Deployment Checklist

### Before Any Deployment
- [ ] Run tests: `npm run test:all`
- [ ] Check TypeScript: `npm run type-check` 
- [ ] Format code: `npm run format`
- [ ] Lint code: `npm run lint`
- [ ] Build locally: `npm run build`

### Vercel-Specific  
- [ ] Verify `vercel.json` configuration
- [ ] Test with: `vercel dev`
- [ ] Check domain configuration
- [ ] Review environment variables in Vercel dashboard

### Replit-Specific
- [ ] Test with: `npm run dev:replit`
- [ ] Verify deployment target is set to "autoscale"
- [ ] Check that SWC fallback is working
- [ ] Test production build: `npm run start:replit`

## 🔄 Deployment Workflow

### Recommended Deployment Process
1. **Development**: Work in Replit for instant feedback
2. **Testing**: Use `npm run e2e:prod` for production tests
3. **Staging**: Deploy preview to Vercel: `npm run deploy:preview`
4. **Production**: Deploy to both platforms: `npm run deploy:dual`

### Automated Deployment
```bash
# Complete automated workflow
npm run auto:complete
```
This will:
- Format and lint code
- Commit changes
- Create pull request
- Merge automatically  
- Deploy to production

## 🛠️ Development Commands

### Local Development
```bash
# Standard Next.js dev server (port 3000)
npm run dev

# Replit-optimized dev server (port 5000)
npm run dev:replit
```

### Production Testing
```bash
# Test production build
npm run build && npm run start

# Test Replit production environment
npm run start:replit
```

## 🎨 Current UI Features

### Modern Design System
- **Glass Morphism Effects**: Backdrop blur with translucent panels
- **Gradient Backgrounds**: Dynamic color schemes for light/dark modes
- **Smooth Animations**: 300ms transitions with easing
- **Responsive Design**: Mobile-first with desktop optimizations

### Theme Support
- **Light Mode**: Blue/purple gradients with high contrast
- **Dark Mode**: Slate/purple gradients with reduced eye strain
- **Auto Theme**: Follows system preference
- **Theme Toggle**: Smooth animated transitions

## 🚨 Troubleshooting

### Common Issues

#### Vercel Deployment Fails
```bash
# Clear Next.js cache and rebuild
npm run clean && npm run build
```

#### Replit Build Issues  
```bash
# Ensure SWC fallback is set
export NEXT_SWC_DISABLE_NATIVE=1
npm run build
```

#### CORS/Domain Issues
- Verify domain settings in both platforms
- Check `next.config.js` for allowed origins
- Review security headers in `vercel.json`

#### Performance Issues
- Monitor bundle size with `npm run build`
- Check Three.js components are client-side only
- Verify image optimization settings

## 📊 Monitoring & Analytics

### Vercel Analytics
- Built-in performance monitoring
- Real-time traffic analytics  
- Edge function insights

### Replit Monitoring
- Resource usage in deployment dashboard
- Error logging in application logs
- Performance metrics for scaling decisions

## 🔐 Security Considerations

### Production Security
- CSP headers configured in `vercel.json`
- HTTPS enforced on both platforms
- Environment variables properly secured
- No sensitive data in client bundles

### API Security  
- Rate limiting on API routes
- Input validation on all endpoints
- Secure headers for all responses
- CORS properly configured

---

## 📞 Support Contacts

- **Vercel Issues**: Vercel support dashboard
- **Replit Issues**: Replit support (agent cannot handle billing)
- **Application Issues**: Development team

**Last Updated**: September 11, 2025  
**Version**: AutoCrate v3.0.0  
**Status**: ✅ Dual Deployment Ready