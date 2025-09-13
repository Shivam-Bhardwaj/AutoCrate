# Setting up autocrate.shivambhardwaj.com with Vercel CLI

## Step 1: Install and Login to Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel (will open browser)
vercel login

# Link your project (if not already linked)
vercel link
```

## Step 2: Add Custom Domain

```bash
# Add the custom domain
vercel domains add autocrate.shivambhardwaj.com

# Or add it directly to your project
vercel domains add autocrate.shivambhardwaj.com --project autocrate
```

## Step 3: Configure DNS in Cloudflare

After adding the domain, Vercel will give you DNS records to add. You'll need to add these to your Cloudflare DNS:

### DNS Records to Add:
```
Type: CNAME
Name: autocrate
Content: cname.vercel-dns.com
Proxy status: Proxied (orange cloud)
TTL: Auto
```

## Step 4: Verify Domain

```bash
# Check domain status
vercel domains ls

# Verify the domain is working
vercel domains verify autocrate.shivambhardwaj.com
```

## Alternative: Use Vercel Dashboard

If CLI doesn't work, you can also:

1. Go to https://vercel.com/dashboard
2. Select your "autocrate" project
3. Go to Settings → Domains
4. Add domain: `autocrate.shivambhardwaj.com`
5. Copy the DNS records and add them to Cloudflare

## Expected Result

After setup, both URLs will work:
- ✅ https://autocrate.vercel.app (original)
- ✅ https://autocrate.shivambhardwaj.com (custom domain)

## Troubleshooting

If domain doesn't work:
1. Check DNS propagation: https://dnschecker.org
2. Verify Cloudflare proxy is enabled (orange cloud)
3. Wait 5-10 minutes for DNS propagation
4. Check Vercel domain status in dashboard

## Commands Summary

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Add domain
vercel domains add autocrate.shivambhardwaj.com

# Check status
vercel domains ls
```
