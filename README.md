# 🚀 FAI-X Deep Link Server

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

**Self-hosted Deferred Deep Linking Server với Product Sharing Module**

Giải pháp deep linking hoàn chỉnh cho ứng dụng mobile, hỗ trợ Universal Links (iOS) và App Links (Android)

[Tính Năng](#-tính-năng) • [Cài Đặt](#-cài-đặt-nhanh) • [Documentation](#-documentation) • [API](#-api-endpoints)

</div>

---

## 📖 Tổng Quan

FAI-X Deep Link Server là một hệ thống self-hosted cho phép bạn:

✅ **Share sản phẩm** qua link động  
✅ **Mở app tự động** nếu đã cài đặt  
✅ **Điều hướng Store** nếu chưa cài (App Store/Play Store)  
✅ **Deferred Deep Link** - truyền data vào app sau khi cài đặt  
✅ **Analytics & Tracking** - theo dõi clicks, conversions  
✅ **Universal Links** (iOS) và **App Links** (Android)

### 🎯 Use Cases

- **E-commerce**: Share sản phẩm qua link
- **Referral Program**: Mời bạn bè với mã giới thiệu
- **Marketing Campaigns**: Track hiệu quả chiến dịch
- **Social Sharing**: Chia sẻ nội dung lên mạng xã hội

---

## 🎁 Tính Năng

### Core Features

- 🔗 **Product Share Links** - Tạo link share cho từng sản phẩm
- 📱 **Multi-platform Support** - iOS, Android, Web
- 🎯 **Smart Redirects** - Tự động detect platform và redirect
- 💾 **Click Tracking** - Lưu trữ và phân tích clicks
- 📊 **Analytics** - Thống kê chi tiết theo sản phẩm
- ⚡ **Fast & Lightweight** - Node.js + Express
- 🔒 **Rate Limiting** - Bảo vệ API khỏi abuse
- 🌐 **Universal/App Links** - Native deep linking
- ✨ **SEO & Social Sharing** - Đầy đủ meta tags cho Facebook, Telegram, Zalo, Twitter

### Technical Features

- ✨ **SOLID Principles** - Code architecture tốt, dễ maintain
- 🧩 **Modular Design** - Tách biệt services, routes, middleware
- 📝 **TypeScript Ready** - Có thể chuyển sang TypeScript dễ dàng
- 🚀 **Production Ready** - Sẵn sàng deploy lên production
- 🔄 **Graceful Shutdown** - Handle signals properly
- 🧹 **Auto Cleanup** - Tự động xóa expired data

---

## ⚡ Cài Đặt Nhanh

### Prerequisites

- Node.js >= 16.x
- npm hoặc yarn
- Domain với HTTPS (cho production)

### 1. Clone & Install

```bash
git clone <repository-url>
cd selfhost-deeplink-demo
npm install
```

### 2. Configuration

Tạo file `.env`:

```bash
cp .env.example .env
```

Cập nhật các giá trị:

```env
PORT=8080
NODE_ENV=development
DOMAIN=localhost

# App Store Links
ANDROID_STORE=https://play.google.com/store/apps/details?id=com.nfc.faix
IOS_STORE=https://apps.apple.com/us/app/fai-x/id6737755560

# App Configuration
APP_SCHEME=fai-x
APP_PACKAGE=com.82faix.nfc
IOS_TEAM_ID=YOUR_TEAM_ID
IOS_BUNDLE_ID=com.82faix.nfc
```

### 3. Run

```bash
# Development với auto-reload
npm run dev

# Production
npm start
```

Server sẽ chạy tại `http://localhost:8080`

---

## 🔌 API Endpoints

### 🌐 Public Endpoints (Deep Links)

#### **GET /share** ✨ NEW: With SEO Meta Tags
Share sản phẩm - endpoint chính với đầy đủ meta tags SEO

```bash
# Example
https://app-faix.vercel.app/share?id=99:33:E2:00:00:00:02&ref=USER456
```

**Query Parameters:**
- `id` (required) - ID sản phẩm/resource
- `shareId` (optional) - ID của share link
- `ref` (optional) - Referral code
- `userId` (optional) - User ID người share
- `utm_*` (optional) - UTM parameters

**Response:** HTML page với đầy đủ meta tags (Open Graph, Twitter Card) và auto-redirect

**SEO Features:**
- ✅ Open Graph tags (Facebook, Telegram, Zalo)
- ✅ Twitter Card tags
- ✅ Beautiful preview khi share trên mạng xã hội
- ✅ Auto-redirect cho người dùng thật (100ms)
- ✅ Bot crawler đọc được meta tags đầy đủ

---

#### **GET /invite**
Invite link (legacy, backwards compatible)

```bash
https://dl.fai-x.com/invite?ref=REFERRAL_CODE
```

---

#### **GET /product/:productId**
Direct product link (Universal/App Link)

```bash
https://dl.fai-x.com/product/PROD123
```

---

#### **GET /open**
Landing page để mở app

```bash
https://dl.fai-x.com/open?clickId=abc123&productId=PROD123
```

---

#### **GET /referrer/:clickId**
Lấy thông tin click (dùng trong app)

```bash
curl https://dl.fai-x.com/referrer/CLICK_ID
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "click-id-here",
    "type": "product_share",
    "productId": "PROD123",
    "ref": "USER456",
    "platform": "ios",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 🔐 API Endpoints (Protected with Rate Limiting)

#### **POST /api/product/generate-share-link**
Tạo share link cho sản phẩm

```bash
curl -X POST https://app-faix.vercel.app/api/product/generate-share-link \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "99:33:E2:00:00:00:02",
    "userId": "USER456",
    "ref": "campaign2024",
    "metadata": {
      "campaign": "summer-sale",
      "source": "email"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shareId": "uuid-here",
    "shareLink": "https://app-faix.vercel.app/share?id=99:33:E2:00:00:00:02&shareId=uuid-here&userId=USER456&ref=campaign2024",
    "shortLink": "https://app-faix.vercel.app/s/xyz123",
    "productId": "99:33:E2:00:00:00:02",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### **POST /api/product/update-metadata** ✨ NEW
Cập nhật metadata cho sản phẩm (cho SEO và social sharing)

```bash
curl -X POST https://app-faix.vercel.app/api/product/update-metadata \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "99:33:E2:00:00:00:02",
    "title": "iPhone 15 Pro Max - Chính Hãng VN/A | FAI-X",
    "description": "iPhone 15 Pro Max mới 100%, giá tốt nhất thị trường. Bảo hành 12 tháng chính hãng Apple.",
    "image": "https://cdn.example.com/iphone-15-pro-max.jpg"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "99:33:E2:00:00:00:02",
    "title": "iPhone 15 Pro Max - Chính Hãng VN/A | FAI-X",
    "description": "iPhone 15 Pro Max mới 100%...",
    "image": "https://cdn.example.com/iphone-15-pro-max.jpg",
    "updatedAt": "2025-10-29T10:30:00.000Z"
  },
  "message": "Metadata updated successfully"
}
```

---

#### **GET /api/product/stats/:productId**
Thống kê cho sản phẩm

```bash
curl http://localhost:8080/api/product/stats/PROD123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "PROD123",
    "totalClicks": 150,
    "uniqueUsers": 120,
    "byPlatform": {
      "android": 80,
      "ios": 60,
      "web": 10
    },
    "recentClicks": [...]
  }
}
```

---

#### **GET /api/product/click/:clickId**
Lấy thông tin click cụ thể

```bash
curl http://localhost:8080/api/product/click/CLICK_ID
```

---

### 🔧 Debug Endpoints

#### **GET /debug/referrals**
Xem tất cả referrals

```bash
curl http://localhost:8080/debug/referrals
```

---

#### **GET /debug/stats**
Xem tổng thống kê

```bash
curl http://localhost:8080/debug/stats
```

---

#### **GET /health**
Health check

```bash
curl http://localhost:8080/health
```

---

## 📱 Mobile App Integration

### Cách Sử Dụng trong App

#### 1. **Tạo Share Link**

Trong app của bạn, khi user muốn share sản phẩm:

```typescript
const createShareLink = async (productId: string) => {
  const response = await fetch('https://dl.fai-x.com/api/product/generate-share-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId,
      userId: currentUser.id,
      ref: currentUser.referralCode,
    }),
  });
  
  const data = await response.json();
  return data.data.shareLink;
};

// Usage
const shareLink = await createShareLink('PROD123');
Share.open({ url: shareLink, message: 'Check out this product!' });
```

#### 2. **Handle Deep Link trong App**

Khi user click vào link và mở app:

```typescript
// App.tsx hoặc index.js
import { Linking } from 'react-native';

useEffect(() => {
  // Handle initial URL
  Linking.getInitialURL().then(handleDeepLink);
  
  // Handle URL when app is open
  Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
}, []);

const handleDeepLink = async (url: string | null) => {
  if (!url) return;
  
  const urlObj = new URL(url);
  const clickId = urlObj.searchParams.get('clickId');
  
  if (clickId) {
    // Fetch full click data
    const response = await fetch(`https://dl.fai-x.com/referrer/${clickId}`);
    const data = await response.json();
    
    if (data.success && data.data.productId) {
      // Navigate to product
      navigation.navigate('ProductDetail', {
        productId: data.data.productId
      });
    }
  }
};
```

📚 **Chi tiết hơn**: Xem [Integration Guide](./docs/INTEGRATION_GUIDE.md)

---

## ✨ SEO & Social Sharing (NEW)

### Tổng Quan

Khi share link trên Facebook, Telegram, Zalo, Twitter... link sẽ hiển thị preview đẹp với ảnh, tiêu đề và mô tả. Hệ thống tự động:
- ✅ Bot crawler đọc được meta tags đầy đủ
- ✅ Người dùng thật được redirect ngay lập tức
- ✅ Hỗ trợ Open Graph và Twitter Card

### Quick Start

#### 1. Share Link Cơ Bản

```
https://app-faix.vercel.app/share?id=99:33:E2:00:00:00:02
```

Link này sẽ:
- Hiển thị preview đẹp trên social media
- Tự động redirect người dùng đến app/store
- Track clicks và analytics

#### 2. Update Metadata cho Sản Phẩm

```bash
curl -X POST https://app-faix.vercel.app/api/product/update-metadata \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "99:33:E2:00:00:00:02",
    "title": "iPhone 15 Pro Max | FAI-X",
    "description": "iPhone 15 Pro Max chính hãng, giá tốt nhất",
    "image": "https://cdn.example.com/iphone15.jpg"
  }'
```

#### 3. Test Preview

- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- Paste link và check preview

### Meta Tags Hỗ Trợ

- ✅ Open Graph (Facebook, Telegram, Zalo)
  - `og:title`, `og:description`, `og:image`, `og:url`
- ✅ Twitter Card
  - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- ✅ Primary meta tags
  - `<title>`, `<meta name="description">`

### Best Practices

**Hình Ảnh:**
- Kích thước: 1200 x 630px (tỷ lệ 1.91:1)
- Format: JPG, PNG, WebP
- Dung lượng: < 5MB
- **Phải dùng HTTPS**

**Tiêu Đề:**
- Độ dài: 60-90 ký tự
- Format: `Tên Sản Phẩm - USP | Brand`

**Mô Tả:**
- Độ dài: 150-200 ký tự
- Có call-to-action (CTA)

### Documentation

📚 **Hướng dẫn chi tiết**: [SEO Sharing Guide](./docs/SEO_SHARING_GUIDE.md)  
💻 **Code examples**: [examples/seo-metadata-example.js](./examples/seo-metadata-example.js)  
📝 **Feature summary**: [SEO_FEATURE_SUMMARY.md](./SEO_FEATURE_SUMMARY.md)

---

## 🏗️ Kiến Trúc

### Project Structure

```
selfhost-deeplink-demo/
├── src/
│   ├── config/
│   │   └── app.config.js          # Centralized configuration
│   ├── services/
│   │   ├── database.service.js     # Database operations
│   │   ├── product-share.service.js # Product sharing logic
│   │   └── deep-link.service.js    # Deep link handling
│   ├── routes/
│   │   ├── product.routes.js       # Product API routes
│   │   └── deeplink.routes.js      # Deep link routes
│   ├── middleware/
│   │   ├── rate-limiter.js         # Rate limiting
│   │   └── error-handler.js        # Error handling
│   └── server.js                   # Main server
├── docs/
│   └── INTEGRATION_GUIDE.md        # Chi tiết integration
├── data/
│   └── referrals.json              # Click data storage
├── .well-known/
│   └── assetlinks.json             # Android App Links
├── apple-app-site-association      # iOS Universal Links
├── .env.example                    # Environment template
├── package.json
└── README.md
```

### Architecture Principles

✨ **SOLID Principles**
- Single Responsibility: Mỗi module có 1 trách nhiệm rõ ràng
- Open/Closed: Dễ dàng extend mà không modify existing code
- Dependency Inversion: Services phụ thuộc vào abstractions

🧩 **Clean Architecture**
- Separation of Concerns
- Modular structure
- Easy to test and maintain

---

## 🚀 Production Deployment

### 1. Server Setup

#### Requirements
- Domain với HTTPS (bắt buộc)
- Node.js >= 16.x
- Reverse proxy (Nginx/Caddy)

#### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name dl.fai-x.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Serve association files
    location /.well-known/ {
        alias /path/to/selfhost-deeplink-demo/.well-known/;
        default_type application/json;
    }

    location /apple-app-site-association {
        alias /path/to/selfhost-deeplink-demo/apple-app-site-association;
        default_type application/json;
    }
}
```

### 2. Configure Association Files

#### iOS: `apple-app-site-association`

Cập nhật `YOUR_TEAM_ID` với Team ID thực tế:

```json
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "YOUR_TEAM_ID.com.82faix.nfc",
      "paths": ["/invite", "/share", "/product/*", "/open"]
    }]
  }
}
```

Upload lên:
- `https://dl.fai-x.com/.well-known/apple-app-site-association`
- `https://dl.fai-x.com/apple-app-site-association`

#### Android: `.well-known/assetlinks.json`

Cập nhật SHA-256 fingerprint:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.82faix.nfc",
    "sha256_cert_fingerprints": ["YOUR_SHA256_HERE"]
  }
}]
```

Upload lên: `https://dl.fai-x.com/.well-known/assetlinks.json`

### 3. Process Manager (PM2)

```bash
npm install -g pm2
pm2 start src/server.js --name faix-deeplink
pm2 save
pm2 startup
```

### 4. Environment Variables

```env
NODE_ENV=production
DOMAIN=dl.fai-x.com
PORT=8080
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_ANALYTICS=true
```

---

## 📊 Monitoring & Analytics

### Metrics to Track

- **Click-through Rate** - Số người click link
- **Conversion Rate** - Số người install app
- **Platform Distribution** - iOS vs Android
- **Popular Products** - Sản phẩm được share nhiều nhất
- **Referral Performance** - Hiệu quả referral codes

### Access Logs

```bash
# View all clicks
curl http://localhost:8080/debug/referrals

# View statistics
curl http://localhost:8080/debug/stats
```

---

## 🧪 Testing

### Test Locally

```bash
# Start server
npm run dev

# Generate a share link
curl -X POST http://localhost:8080/api/product/generate-share-link \
  -H "Content-Type: application/json" \
  -d '{"productId": "TEST123"}'

# Test the link
# Copy shareLink từ response và mở trong mobile browser
```

### Test on Device

#### iOS:
```bash
# Test Universal Link
# Create test.html with link, open in Safari

# Test URL Scheme
xcrun simctl openurl booted "fai-x://product/TEST123"
```

#### Android:
```bash
# Test App Link
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://dl.fai-x.com/share?productId=TEST123"

# Test URL Scheme
adb shell am start -W -a android.intent.action.VIEW \
  -d "fai-x://product/TEST123"
```

---

## 📚 Documentation

- **[Integration Guide](./docs/INTEGRATION_GUIDE.md)** - Chi tiết integration cho iOS & Android
- **[API Documentation](#-api-endpoints)** - API reference đầy đủ
- **[Architecture](#-kiến-trúc)** - Kiến trúc hệ thống

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - see LICENSE file for details

---

## 💬 Support

Nếu có vấn đề hoặc câu hỏi:

- 📧 Email: support@fai-x.com
- 🐛 Issues: [GitHub Issues]
- 📖 Docs: [Integration Guide](./docs/INTEGRATION_GUIDE.md)

---

<div align="center">

**Made with ❤️ by FAI-X Team**

[⬆ Back to Top](#-fai-x-deep-link-server)

</div>
