# AutoCrate Project Setup Guide

## 🚀 Quick Start

### For Admin PowerShell Setup:
```bash
# Run the automated setup script
npm run setup:admin
```

### For Vercel Domain Setup:
```bash
# Setup custom domain
npm run vercel:setup
```

## 📁 Project Structure

```
autocrate-final/
├── .vscode/                 # VS Code/Cursor project settings
│   ├── settings.json        # Terminal and editor settings
│   ├── tasks.json          # Custom tasks
│   └── launch.json         # Debug configurations
├── scripts/                 # Project scripts
│   └── setup-admin-powershell.ps1
├── src/                     # Source code
├── package.json            # Project dependencies and scripts
└── PROJECT-SETUP.md        # This file
```

## 🔧 Available Commands

### Development:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Testing:
```bash
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Vercel:
```bash
npm run vercel:setup    # Setup Vercel and custom domain
npm run vercel:deploy   # Deploy to production
```

### Admin Setup:
```bash
npm run setup:admin     # Run admin PowerShell setup
```

## 🌐 Custom Domain Setup

The project is configured to work with:
- **Primary URL**: https://autocrate.vercel.app
- **Custom URL**: https://autocrate.shivambhardwaj.com

### DNS Configuration (Cloudflare):
```
Type: CNAME
Name: autocrate
Content: cname.vercel-dns.com
Proxy: Enabled (orange cloud)
```

## 🎯 Project Features

- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **3D Visualization**: Interactive crate viewer
- ✅ **Real-time Validation**: Applied Materials standards
- ✅ **Export Functionality**: NX, STEP, PDF exports
- ✅ **Professional UI**: Modern, clean interface
- ✅ **Auto-fit Camera**: Dynamic 3D camera positioning

## 🔧 Troubleshooting

### Terminal Issues:
- Use `npm run setup:admin` for admin PowerShell
- Check `.vscode/settings.json` for terminal configuration

### Vercel Issues:
- Run `npm run vercel:setup` to reconfigure
- Check Vercel dashboard for domain status

### Development Issues:
- Run `npm run type-check` to check TypeScript
- Run `npm run lint` to check code quality
