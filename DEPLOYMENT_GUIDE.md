# 🚀 FAI-X Deep Link Server - Deployment Guide

## Làm Sao Để Association Files Accessible qua HTTPS

Để Universal Links (iOS) và App Links (Android) hoạt động, 2 files sau phải accessible qua HTTPS:

- `apple-app-site-association` (iOS)
- `.well-known/assetlinks.json` (Android)

---

## ✅ Solution: Server Đã Tích Hợp Sẵn!

Server đã được cấu hình để serve 2 files này. Chỉ cần deploy và test!

### Routes Đã Có:

```javascript
// iOS Universal Links
GET /.well-known/apple-app-site-association
GET /apple-app-site-association

// Android App Links
GET /.well-known/assetlinks.json
```

---

## 🧪 Test Local

### 1. Start Server

```bash
cd /Users/vanthuongdao/Documents/BurningBros/DeferredDeepLink/selfhost-deeplink-demo
npm run dev
```

### 2. Test Endpoints

```bash
# iOS - Both paths should work
curl http://localhost:8080/.well-known/apple-app-site-association
curl http://localhost:8080/apple-app-site-association

# Android
curl http://localhost:8080/.well-known/assetlinks.json

# Should return JSON with your Team ID and SHA-256
```

### 3. Verify Content-Type

```bash
curl -I http://localhost:8080/.well-known/apple-app-site-association

# Should show:
# Content-Type: application/json
```

---

## 🌐 Production Deployment Options

### Option 1: VPS với Nginx (Recommended) ⭐

Đây là cách phổ biến và reliable nhất.

#### A. Setup VPS

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx nodejs npm

# Install PM2
sudo npm install -g pm2
```

#### B. Deploy Code

```bash
# 1. Clone/upload code lên server
git clone <your-repo> /var/www/deeplink-server
cd /var/www/deeplink-server

# 2. Install dependencies
npm install --production

# 3. Setup environment
cp .env.example .env
nano .env  # Update với production values

# 4. Start with PM2
pm2 start src/server.js --name faix-deeplink
pm2 save
pm2 startup
```

#### C. Configure Nginx

Tạo file `/etc/nginx/sites-available/deeplink`:

```nginx
server {
    listen 80;
    server_name dl.fai-x.com;  # ← Thay bằng domain của bạn
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dl.fai-x.com;  # ← Thay bằng domain của bạn

    # SSL Certificate (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/dl.fai-x.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dl.fai-x.com/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Logging
    access_log /var/log/nginx/deeplink-access.log;
    error_log /var/log/nginx/deeplink-error.log;
}
```

#### D. Enable Site & Get SSL Certificate

```bash
# 1. Enable site
sudo ln -s /etc/nginx/sites-available/deeplink /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl reload nginx

# 2. Get SSL certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dl.fai-x.com

# Certbot tự động cấu hình HTTPS!
```

#### E. Verify

```bash
# Test HTTPS
curl -I https://dl.fai-x.com/.well-known/apple-app-site-association
curl -I https://dl.fai-x.com/.well-known/assetlinks.json

# Should return:
# HTTP/2 200
# content-type: application/json
```

---

### Option 2: Heroku (Quick Deploy) ⚡

#### A. Prepare Files

```bash
# Đảm bảo có Procfile
echo "web: node src/server.js" > Procfile

# Đảm bảo package.json có start script
# (đã có rồi)
```

#### B. Deploy

```bash
# 1. Login Heroku
heroku login

# 2. Create app
heroku create faix-deeplink

# 3. Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# 4. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DOMAIN=faix-deeplink.herokuapp.com

# 5. Open app
heroku open
```

#### C. Test

```bash
curl https://faix-deeplink.herokuapp.com/.well-known/apple-app-site-association
```

#### D. Custom Domain (Optional)

```bash
# Add custom domain
heroku domains:add dl.fai-x.com

# Follow instructions to update DNS
# Heroku provides automatic SSL!
```

---

### Option 3: Railway / Render (Modern Alternative) 🚄

#### Railway:

1. Visit [railway.app](https://railway.app)
2. Connect GitHub repo
3. Deploy → Railway tự động:
   - Install dependencies
   - Start server
   - Provide HTTPS URL
4. Add custom domain (optional)

#### Render:

1. Visit [render.com](https://render.com)
2. New Web Service → Connect repo
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Deploy → Render provides HTTPS
6. Add custom domain (optional)

---

### Option 4: DigitalOcean App Platform 🌊

1. Create account at [DigitalOcean](https://digitalocean.com)
2. App Platform → Create App
3. Connect GitHub repo
4. Configure:
   - Environment: Node.js
   - Build Command: `npm install`
   - Run Command: `npm start`
5. Deploy → Automatic HTTPS
6. Add custom domain (optional)

---

## 🔐 SSL Certificate Options

### Option 1: Let's Encrypt (Free) ✅

```bash
# Nginx
sudo certbot --nginx -d dl.fai-x.com

# Apache
sudo certbot --apache -d dl.fai-x.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Option 2: Cloudflare (Free + CDN) ⚡

1. Add domain to Cloudflare
2. Update nameservers
3. Enable "Always Use HTTPS"
4. Automatic SSL certificate!

### Option 3: Platform-Provided (Heroku, Railway, etc.)

Most modern platforms provide automatic HTTPS!

---

## 🧪 Testing Checklist

### Local Testing

```bash
# 1. Start server
npm run dev

# 2. Test endpoints
curl http://localhost:8080/.well-known/apple-app-site-association
curl http://localhost:8080/.well-known/assetlinks.json
curl http://localhost:8080/health

# 3. Test with query parameters
curl "http://localhost:8080/share?productId=TEST123"
```

### Production Testing

```bash
# 1. Test HTTPS
curl -I https://dl.fai-x.com/health

# 2. Test iOS file
curl https://dl.fai-x.com/.well-known/apple-app-site-association
curl https://dl.fai-x.com/apple-app-site-association

# 3. Test Android file
curl https://dl.fai-x.com/.well-known/assetlinks.json

# 4. Validate with Google
curl "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://dl.fai-x.com"

# 5. Test Apple CDN (after 24h)
curl https://app-site-association.cdn-apple.com/a/v1/dl.fai-x.com
```

### Device Testing

```bash
# iOS Simulator
xcrun simctl openurl booted "https://dl.fai-x.com/share?productId=TEST123"

# Android Device/Emulator
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://dl.fai-x.com/share?productId=TEST123"
```

---

## 🔧 Troubleshooting

### Problem 1: Files Not Found (404)

**Check:**
```bash
# Verify files exist
ls -la apple-app-site-association
ls -la .well-known/assetlinks.json

# Check server routes
curl -v http://localhost:8080/.well-known/apple-app-site-association
```

**Solution:** Server routes đã được add, restart server:
```bash
pm2 restart faix-deeplink
```

### Problem 2: Wrong Content-Type

**Check:**
```bash
curl -I https://dl.fai-x.com/.well-known/apple-app-site-association
```

**Should show:** `Content-Type: application/json`

**If wrong:** Server đã set đúng, check Nginx config không override.

### Problem 3: HTTPS Not Working

**Check SSL:**
```bash
curl -I https://dl.fai-x.com
```

**Solutions:**
- Certbot: `sudo certbot renew`
- Check Nginx: `sudo nginx -t`
- Check firewall: `sudo ufw status`

### Problem 4: iOS Universal Links Not Working

**Check:**
1. File accessible: `curl https://dl.fai-x.com/.well-known/apple-app-site-association`
2. Valid JSON: Copy output → JSONLint
3. Team ID correct: `EAYXYBF4LF`
4. HTTPS working
5. Clear Safari cache
6. Reinstall app

### Problem 5: Android App Links Not Working

**Check:**
1. File accessible: `curl https://dl.fai-x.com/.well-known/assetlinks.json`
2. SHA-256 correct
3. Package name: `com.82faix.nfc`
4. Validate: `curl "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://dl.fai-x.com"`
5. Reinstall app

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code tested locally
- [ ] Environment variables configured
- [ ] Domain purchased
- [ ] DNS configured

### Server Setup
- [ ] VPS/Platform chosen
- [ ] Node.js installed
- [ ] Code deployed
- [ ] Dependencies installed
- [ ] PM2/Process manager setup

### Web Server
- [ ] Nginx/Apache installed
- [ ] Virtual host configured
- [ ] SSL certificate obtained
- [ ] HTTPS working
- [ ] Redirects configured (HTTP → HTTPS)

### Association Files
- [ ] `apple-app-site-association` accessible
- [ ] `assetlinks.json` accessible
- [ ] Both return `Content-Type: application/json`
- [ ] Both accessible over HTTPS (not HTTP)

### Testing
- [ ] Health endpoint works
- [ ] API endpoints work
- [ ] Association files accessible
- [ ] Google validator passes (Android)
- [ ] Apple CDN caches file (wait 24h)
- [ ] Test on real devices

### Mobile Apps
- [ ] iOS: Associated Domains configured
- [ ] Android: App Links configured
- [ ] Both: Deep link handlers implemented
- [ ] Test with simulators/emulators
- [ ] Test on real devices

### Post-Deployment
- [ ] Monitor logs
- [ ] Check analytics
- [ ] Setup alerts
- [ ] Document deployment process

---

## 🎯 Quick Deploy Commands

### VPS (Ubuntu) - Complete Setup

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install Nginx
sudo apt install -y nginx

# 4. Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# 5. Clone code
cd /var/www
sudo git clone <your-repo> deeplink-server
cd deeplink-server
sudo npm install --production

# 6. Setup PM2
sudo npm install -g pm2
pm2 start src/server.js --name faix-deeplink
pm2 save
pm2 startup

# 7. Configure Nginx
sudo nano /etc/nginx/sites-available/deeplink
# (paste config from above)

sudo ln -s /etc/nginx/sites-available/deeplink /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 8. Get SSL
sudo certbot --nginx -d dl.fai-x.com

# 9. Test
curl https://dl.fai-x.com/health
curl https://dl.fai-x.com/.well-known/apple-app-site-association
curl https://dl.fai-x.com/.well-known/assetlinks.json

# Done! 🎉
```

---

## 📊 Cost Comparison

| Platform | Cost/Month | SSL | Setup Time | Pros |
|----------|------------|-----|------------|------|
| **VPS (DO/Linode)** | $5-10 | Free (Let's Encrypt) | 30 min | Full control, scalable |
| **Heroku** | $7-25 | Free | 5 min | Easy, auto-deploy |
| **Railway** | $5-10 | Free | 5 min | Modern, simple |
| **Render** | $7-25 | Free | 5 min | Auto-deploy, easy |
| **Vercel** (Static only) | Free | Free | 2 min | Fast, but limited |

**Recommendation:** VPS nếu cần control, Railway/Render nếu muốn đơn giản.

---

## 🔗 Useful Resources

- [Let's Encrypt](https://letsencrypt.org/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [PM2 Docs](https://pm2.keymetrics.io/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/deploying-nodejs)

---

## 🎉 Summary

**Server đã sẵn sàng serve association files!**

✅ Routes đã có  
✅ Content-Type đúng  
✅ Chỉ cần deploy với HTTPS  

**Next Steps:**
1. Chọn platform deploy (VPS recommended)
2. Setup domain + SSL
3. Deploy code
4. Test endpoints
5. Update mobile apps với domain
6. Test end-to-end
7. 🚀 Launch!

---

**Need Help?** Check troubleshooting section hoặc test local trước!

