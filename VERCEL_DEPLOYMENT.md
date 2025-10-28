# 🚀 Deploy FAI-X Deep Link Server to Vercel

## Tổng Quan

Server đã được cấu hình sẵn để deploy lên [Vercel](https://vercel.com) theo [Vercel Express documentation](https://vercel.com/docs/frameworks/backend/express).

## ✅ Đã Chuẩn Bị

### 1. Code Structure
- ✅ Express app ở `src/server.js` (Vercel auto-detect)
- ✅ Export app as default export: `export default app`
- ✅ Conditional port listening (chỉ local dev)
- ✅ Public directory cho static files

### 2. Configuration Files
- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Files to ignore
- ✅ `package.json` - Đã có engines và scripts

### 3. Environment Variables
Vercel sẽ cần các env vars từ `.env`

---

## 🚀 Deploy Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Push Code to Git

```bash
# Initialize git (nếu chưa có)
git init
git add .
git commit -m "Ready for Vercel deployment"

# Push to GitHub/GitLab/Bitbucket
git remote add origin <your-repo-url>
git push -u origin main
```

#### Step 2: Import to Vercel

1. Đăng nhập [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel auto-detect Express framework ✅
5. Configure project:
   - **Framework Preset:** Other (hoặc để auto-detect)
   - **Root Directory:** `./`
   - **Build Command:** `npm install` (mặc định)
   - **Output Directory:** Leave empty

#### Step 3: Environment Variables

Add environment variables trong Vercel Dashboard:

```env
NODE_ENV=production
DOMAIN=your-project.vercel.app
ANDROID_STORE=https://play.google.com/store/apps/details?id=com.nfc.faix
IOS_STORE=https://apps.apple.com/us/app/fai-x/id6737755560
LANDING_PAGE=https://fai-x.com/
APP_SCHEME=fai-x
APP_PACKAGE=com.82faix.nfc
IOS_TEAM_ID=EAYXYBF4LF
IOS_BUNDLE_ID=com.82faix.nfc
ENABLE_ANALYTICS=true
CLICK_EXPIRY_DAYS=30
```

**Important:** Không add `PORT` vì Vercel tự động handle!

#### Step 4: Deploy

Click **"Deploy"** → Vercel sẽ build và deploy tự động! 🎉

---

### Option 2: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login

```bash
vercel login
```

#### Step 3: Deploy

```bash
# Development deployment (preview)
vercel

# Production deployment
vercel --prod
```

#### Step 4: Set Environment Variables

```bash
# Set via CLI
vercel env add NODE_ENV
vercel env add DOMAIN
vercel env add ANDROID_STORE
# ... các biến khác

# Hoặc import từ file
vercel env pull
```

---

## 🌐 Custom Domain

### Add Custom Domain (dl.fai-x.com)

1. Vào Project Settings → **Domains**
2. Add domain: `dl.fai-x.com`
3. Vercel sẽ cung cấp DNS records
4. Update DNS tại domain provider:

```
Type: CNAME
Name: dl
Value: cname.vercel-dns.com
```

5. Wait for DNS propagation (5-10 phút)
6. Vercel tự động provision SSL certificate! ✅

---

## 🔧 Vercel Configuration

### vercel.json

```json
{
  "version": 2,
  "buildCommand": "npm install",
  "outputDirectory": "public",
  "framework": null,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "src/server.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

**Key Points:**
- `routes`: Forward all requests to Express app
- `functions.memory`: 1024MB for better performance
- `functions.maxDuration`: 30s timeout (max for Pro plan)

---

## 📱 Update Mobile Apps

Sau khi deploy, update domain trong mobile apps:

### iOS (Xcode)

1. **Associated Domains:**
   ```
   applinks:your-project.vercel.app
   ```
   Hoặc với custom domain:
   ```
   applinks:dl.fai-x.com
   ```

2. **Verify association file:**
   ```bash
   curl https://your-project.vercel.app/.well-known/apple-app-site-association
   ```

### Android (AndroidManifest.xml)

```xml
<data
    android:scheme="https"
    android:host="your-project.vercel.app"
    android:pathPrefix="/product" />
```

Update `.well-known/assetlinks.json` verification:
```bash
curl https://your-project.vercel.app/.well-known/assetlinks.json
```

---

## 🧪 Testing

### Test Endpoints

```bash
# Set your Vercel URL
VERCEL_URL="https://your-project.vercel.app"

# Health check
curl $VERCEL_URL/health

# Association files
curl $VERCEL_URL/.well-known/apple-app-site-association
curl $VERCEL_URL/.well-known/assetlinks.json

# Generate share link
curl -X POST $VERCEL_URL/api/product/generate-share-link \
  -H "Content-Type: application/json" \
  -d '{"productId": "TEST123"}'

# Test share link
curl "$VERCEL_URL/share?productId=TEST123"

# Stats
curl $VERCEL_URL/debug/stats
```

### Test from Mobile

```bash
# iOS Simulator
xcrun simctl openurl booted "https://your-project.vercel.app/share?productId=TEST123"

# Android Device
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://your-project.vercel.app/share?productId=TEST123"
```

---

## 📊 Monitoring

### Vercel Dashboard

1. **Deployments** - View deployment history
2. **Analytics** - Traffic analytics (Pro plan)
3. **Logs** - Real-time function logs
4. **Speed Insights** - Performance metrics

### Access Logs

```bash
# Via CLI
vercel logs your-project.vercel.app

# Live tail
vercel logs your-project.vercel.app --follow
```

---

## 🔥 Key Features on Vercel

### 1. **Automatic HTTPS** ✅
- Free SSL certificate
- Auto-renewal
- Custom domain support

### 2. **Global CDN** 🌍
- Association files cached globally
- Fast response times worldwide

### 3. **Preview Deployments** 🔍
- Every Git push = new preview URL
- Test before production

### 4. **Instant Rollback** ↩️
- One-click rollback to previous version
- Zero downtime

### 5. **Environment Variables** 🔐
- Per-environment configs (Development, Preview, Production)
- Encrypted storage

### 6. **Serverless Functions** ⚡
- Express app runs as Vercel Function
- Auto-scaling
- Pay per use

---

## 💾 Database Considerations

### Current: File-based (data/referrals.json)

**⚠️ Important:** Vercel Serverless Functions are **stateless**. File writes won't persist!

### Solutions:

#### Option 1: Vercel KV (Key-Value Storage) ✅ Recommended

```bash
# Enable Vercel KV
vercel link
vercel env pull

# Install SDK
npm install @vercel/kv
```

Update `database.service.js`:
```javascript
import { kv } from '@vercel/kv';

// Read
const referrals = await kv.get('referrals') || [];

// Write
await kv.set('referrals', referrals);
```

#### Option 2: Vercel Postgres

```bash
npm install @vercel/postgres
```

#### Option 3: External Database
- MongoDB Atlas
- Supabase
- PlanetScale
- Neon

---

## 🔧 Troubleshooting

### Problem 1: Functions Timeout

**Error:** Function execution exceeded timeout

**Solution:** Optimize code hoặc upgrade Vercel plan
- Hobby: 10s max
- Pro: 60s max
- Enterprise: 900s max

### Problem 2: Association Files 404

**Check:**
```bash
curl -I https://your-project.vercel.app/.well-known/apple-app-site-association
```

**Solution:** Files đã được serve từ Express routes, should work!

### Problem 3: Environment Variables Not Working

**Check:**
```bash
vercel env ls
```

**Solution:** Add via Dashboard hoặc CLI

### Problem 4: Cold Starts

**Issue:** First request slow after inactivity

**Solutions:**
- Upgrade to Pro (better cold start performance)
- Use Vercel Cron Jobs to keep warm
- Consider Vercel Edge Functions (faster)

---

## 📋 Deployment Checklist

### Pre-Deployment
- [x] Code ready and tested locally
- [x] Environment variables documented
- [x] Git repository created
- [ ] Custom domain purchased (optional)

### Vercel Setup
- [ ] Project created on Vercel
- [ ] Git repository connected
- [ ] Environment variables added
- [ ] Custom domain configured (if any)

### Post-Deployment
- [ ] Test all endpoints
- [ ] Verify association files accessible
- [ ] Update mobile apps with new domain
- [ ] Test Universal/App Links
- [ ] Monitor logs for errors
- [ ] Setup alerts (Pro plan)

### Database Migration (if using KV/Postgres)
- [ ] Enable Vercel KV or Postgres
- [ ] Update database service code
- [ ] Migrate existing data
- [ ] Test thoroughly

---

## 💰 Pricing Considerations

### Vercel Plans

| Feature | Hobby (Free) | Pro ($20/mo) | Enterprise |
|---------|-------------|--------------|------------|
| Functions | 100 GB-hrs | 1000 GB-hrs | Custom |
| Bandwidth | 100 GB | 1 TB | Custom |
| Max Duration | 10s | 60s | 900s |
| Team Members | 1 | Unlimited | Unlimited |
| Analytics | ❌ | ✅ | ✅ |
| Custom Domains | ✅ | ✅ | ✅ |

**Recommendation:**
- **Development/Testing:** Hobby (Free)
- **Production:** Pro ($20/mo)

### Cost Estimation

Với ~10,000 requests/day:
- **Hobby Plan:** Free (nếu trong limits)
- **Pro Plan:** $20/mo base + overage (nếu có)

---

## 🎯 Best Practices

### 1. Use Environment Variables
Never hardcode sensitive data!

### 2. Enable Vercel Analytics
Track performance and user behavior (Pro plan)

### 3. Setup Monitoring
- Vercel Dashboard
- Sentry for error tracking
- Datadog for advanced monitoring

### 4. Use Preview Deployments
Test every change before merging to production

### 5. Implement Caching
Cache API responses when possible

### 6. Database Considerations
Use Vercel KV or external database for persistence

---

## 🔗 Useful Links

- [Vercel Express Documentation](https://vercel.com/docs/frameworks/backend/express)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

---

## 🎉 Summary

✅ **Server ready for Vercel deployment**
- Export Express app: `export default app`
- Conditional port listening
- Association files routes configured
- Environment variables documented

✅ **Configuration files ready**
- `vercel.json` created
- `.vercelignore` created
- `package.json` compatible

✅ **Next Steps:**
1. Push code to Git
2. Import to Vercel
3. Add environment variables
4. Deploy!
5. Update mobile apps with new domain

**Happy Deploying! 🚀**

