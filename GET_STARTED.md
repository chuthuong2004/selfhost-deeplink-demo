# 🎯 FAI-X Deep Link Server - GET STARTED

## Chào mừng bạn đến với FAI-X Deep Link Server! 👋

Hệ thống custom deferred deep linking đã được xây dựng hoàn chỉnh cho ứng dụng FAI-X của bạn.

---

## ✅ Đã Hoàn Thành

### 🏗️ Backend Server
- ✅ Modular architecture với SOLID principles
- ✅ RESTful API với rate limiting
- ✅ Click tracking & analytics
- ✅ Multi-platform support (iOS, Android, Web)
- ✅ Deferred deep linking
- ✅ Universal Links (iOS) & App Links (Android)

### 📱 Platform Configuration
- ✅ iOS: `apple-app-site-association` configured
- ✅ Android: `.well-known/assetlinks.json` configured
- ✅ Smart landing page với app opening logic

### 📚 Documentation
- ✅ Comprehensive README
- ✅ Detailed integration guide
- ✅ Quick start guide
- ✅ Code examples (React Native & Flutter)

---

## 🚀 Bắt Đầu trong 3 Bước

### Bước 1: Start Server (1 phút)

```bash
# Đã ở trong thư mục project
cd /Users/vanthuongdao/Documents/BurningBros/DeferredDeepLink/selfhost-deeplink-demo

# Start development server
npm run dev
```

Server sẽ chạy tại `http://localhost:8080`

### Bước 2: Test Server (2 phút)

Mở terminal mới và test:

```bash
# Test 1: Health check
curl http://localhost:8080/health

# Test 2: Generate share link
curl -X POST http://localhost:8080/api/product/generate-share-link \
  -H "Content-Type: application/json" \
  -d '{"productId": "TEST123", "userId": "USER001"}'

# Test 3: View statistics
curl http://localhost:8080/debug/stats
```

### Bước 3: Đọc Documentation (5 phút)

Chọn một trong các guides:

**Option A: Quick Start** (recommended để bắt đầu)
```bash
cat QUICKSTART.md
```

**Option B: Full Documentation**
```bash
cat README.md
```

**Option C: Integration Guide** (khi sẵn sàng integrate vào app)
```bash
cat docs/INTEGRATION_GUIDE.md
```

---

## 📖 Tài Liệu Quan Trọng

### 1. [QUICKSTART.md](./QUICKSTART.md)
**Đọc đầu tiên!** Hướng dẫn chạy và test server trong 5 phút.

### 2. [README.md](./README.md)
Documentation đầy đủ với:
- Tổng quan hệ thống
- API endpoints
- Kiến trúc
- Production deployment

### 3. [docs/INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md)
Hướng dẫn chi tiết integrate vào mobile app:
- iOS setup (Universal Links)
- Android setup (App Links)
- Code examples
- Troubleshooting

### 4. [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)
Summary của toàn bộ project:
- Architecture overview
- Deployment checklist
- Testing checklist
- Maintenance guide

---

## 🎯 Workflow Khuyến Nghị

### Phase 1: Local Development & Testing (Hiện tại)
```
1. ✅ Setup done
2. → Start server: npm run dev
3. → Test API endpoints
4. → Xem quen với cấu trúc code
```

### Phase 2: Mobile App Integration (Tiếp theo)
```
1. → Đọc Integration Guide
2. → Setup iOS (Xcode configuration)
3. → Setup Android (Manifest configuration)
4. → Implement deep link handling
5. → Test trên simulator/emulator
```

### Phase 3: Testing & Refinement
```
1. → Test trên real devices
2. → Test deferred deep link flow
3. → Verify analytics tracking
4. → Fix bugs nếu có
```

### Phase 4: Production Deployment
```
1. → Setup production server
2. → Configure domain & HTTPS
3. → Upload association files
4. → Deploy server code
5. → Submit app lên stores
6. → Final testing
```

---

## 🔌 API Endpoints Tóm Tắt

### Share Product
```bash
# Generate share link
POST /api/product/generate-share-link
Body: { "productId": "PROD123", "userId": "USER001" }

# Click share link (từ browser/app)
GET /share?productId=PROD123

# Get click data (trong app)
GET /referrer/:clickId
```

### Analytics
```bash
# Product stats
GET /api/product/stats/PROD123

# General stats
GET /debug/stats

# All referrals
GET /debug/referrals
```

---

## 💡 Tips & Best Practices

### Development
- Luôn dùng `npm run dev` để có auto-reload
- Check logs để debug
- Test trên real device càng sớm càng tốt

### Production
- Dùng domain với HTTPS (bắt buộc)
- Setup monitoring (PM2 logs)
- Regular backup database
- Monitor performance metrics

### Mobile Integration
- Test Universal/App Links trước
- Implement fallback với URL schemes
- Handle errors gracefully
- Log everything để debug

---

## 📱 Code Examples

### React Native Integration

Xem full code: [examples/react-native-example.tsx](./examples/react-native-example.tsx)

Quick snippet:

```typescript
import { Linking } from 'react-native';

// Handle deep link
const handleDeepLink = async (url: string) => {
  const urlObj = new URL(url);
  const clickId = urlObj.searchParams.get('clickId');
  
  if (clickId) {
    const response = await fetch(
      `https://dl.fai-x.com/referrer/${clickId}`
    );
    const { data } = await response.json();
    
    if (data.productId) {
      navigation.navigate('ProductDetail', {
        productId: data.productId
      });
    }
  }
};

// Share product
const shareProduct = async (productId: string) => {
  const response = await fetch(
    'https://dl.fai-x.com/api/product/generate-share-link',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    }
  );
  
  const { data } = await response.json();
  await Share.share({ url: data.shareLink });
};
```

### Flutter Integration

Xem full code: [examples/flutter-example.dart](./examples/flutter-example.dart)

---

## 🏗️ Project Structure

```
selfhost-deeplink-demo/
├── src/                    # Source code (MODULAR)
│   ├── config/            # Configuration
│   ├── services/          # Business logic
│   ├── routes/            # API routes
│   ├── middleware/        # Middleware
│   └── server.js          # Main server
│
├── docs/                   # Documentation
│   └── INTEGRATION_GUIDE.md
│
├── examples/              # Code examples
│   ├── react-native-example.tsx
│   └── flutter-example.dart
│
├── data/                  # Database
│   └── referrals.json
│
├── .well-known/           # Platform configs
│   └── assetlinks.json    # Android
│
├── apple-app-site-association  # iOS
├── .env                   # Environment config
├── package.json
│
└── Documentation files:
    ├── README.md           # Main documentation
    ├── QUICKSTART.md       # Quick start guide
    ├── DEPLOYMENT_SUMMARY.md  # Deployment guide
    └── GET_STARTED.md      # This file
```

---

## 🎓 Learning Path

### Ngày 1: Làm quen với hệ thống
- [x] Setup & start server
- [ ] Test API endpoints
- [ ] Đọc QUICKSTART.md
- [ ] Xem code structure

### Ngày 2: Hiểu deep linking
- [ ] Đọc README.md
- [ ] Tìm hiểu Universal Links (iOS)
- [ ] Tìm hiểu App Links (Android)
- [ ] Xem flow diagram

### Ngày 3: Start integration
- [ ] Đọc INTEGRATION_GUIDE.md
- [ ] Setup iOS project
- [ ] Setup Android project
- [ ] Test basic linking

### Ngày 4-5: Implementation
- [ ] Implement deep link handler
- [ ] Implement share functionality
- [ ] Test deferred deep linking
- [ ] Fix issues

### Ngày 6-7: Production ready
- [ ] Setup production server
- [ ] Deploy & test
- [ ] Submit app updates
- [ ] Monitor & optimize

---

## 🐛 Troubleshooting Quick Guide

### Server không start?
```bash
# Check if port is in use
lsof -i :8080

# Check logs
npm run dev
```

### API không hoạt động?
```bash
# Check health
curl http://localhost:8080/health

# Check logs
cat data/referrals.json
```

### Deep link không mở app?
1. Check association files uploaded
2. Clear cache & reinstall app
3. Verify bundle ID / package name
4. Check iOS Team ID / Android SHA-256

Chi tiết troubleshooting: Xem [INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md#troubleshooting)

---

## 📞 Support & Resources

### Documentation
- 📖 [README.md](./README.md) - Full docs
- ⚡ [QUICKSTART.md](./QUICKSTART.md) - Quick start
- 📱 [INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md) - Integration
- 🚀 [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - Deployment

### External Resources
- [Apple Universal Links Guide](https://developer.apple.com/ios/universal-links/)
- [Android App Links Guide](https://developer.android.com/training/app-links)
- [Express.js Documentation](https://expressjs.com/)

---

## ✨ Quick Commands Reference

```bash
# Development
npm run dev              # Start with auto-reload
npm start               # Start production
npm run clean           # Clean database

# Testing
curl http://localhost:8080/health
curl http://localhost:8080/debug/stats

# Monitoring (if using PM2)
pm2 logs faix-deeplink
pm2 monit
pm2 restart faix-deeplink

# Git (nếu cần)
git status
git add .
git commit -m "Update deep link server"
```

---

## 🎯 Next Steps

Bây giờ, hãy:

1. **Start server**
   ```bash
   npm run dev
   ```

2. **Mở guide**
   ```bash
   cat QUICKSTART.md
   ```

3. **Test API**
   ```bash
   curl http://localhost:8080/health
   ```

4. **Đọc integration guide** khi sẵn sàng integrate vào app
   ```bash
   cat docs/INTEGRATION_GUIDE.md
   ```

---

## 🎉 Kết Luận

Bạn đã có một hệ thống custom deferred deep link hoàn chỉnh!

**What you have:**
- ✅ Production-ready server
- ✅ Complete API
- ✅ iOS & Android support
- ✅ Analytics & tracking
- ✅ Comprehensive documentation
- ✅ Code examples

**What to do next:**
- 📱 Integrate vào FAI-X app
- 🧪 Test thoroughly
- 🚀 Deploy to production
- 📊 Monitor & optimize

---

**Happy Coding! 🚀**

Need help? Start with [QUICKSTART.md](./QUICKSTART.md) or [Integration Guide](./docs/INTEGRATION_GUIDE.md)

