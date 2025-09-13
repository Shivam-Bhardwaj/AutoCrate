# Setting up autocrate.shivambhardwaj.com

## Option 1: Vercel Custom Domain (Recommended)

### Steps:
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your "autocrate" project
3. Go to Settings → Domains
4. Add custom domain: `autocrate.shivambhardwaj.com`
5. Follow Vercel's DNS instructions

### DNS Configuration:
Add these DNS records to your domain provider:

```
Type: CNAME
Name: autocrate
Value: cname.vercel-dns.com
```

## Option 2: Nginx Reverse Proxy

If you have a server, you can set up Nginx:

```nginx
server {
    listen 80;
    server_name autocrate.shivambhardwaj.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Option 3: Cloudflare Proxy

1. Add domain to Cloudflare
2. Create CNAME record: `autocrate` → `autocrate.vercel.app`
3. Enable Cloudflare proxy (orange cloud)

## Option 4: Apache Virtual Host

```apache
<VirtualHost *:80>
    ServerName autocrate.shivambhardwaj.com
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

## SSL Certificate

For HTTPS, you'll need an SSL certificate:
- **Vercel**: Automatic SSL
- **Cloudflare**: Automatic SSL
- **Nginx/Apache**: Use Let's Encrypt

## Testing

After setup, test with:
```bash
curl -I http://autocrate.shivambhardwaj.com
```

## Current Status

Your app is deployed at: https://autocrate.vercel.app
Target domain: autocrate.shivambhardwaj.com
