# 🔗 Universal Links & App Links Setup Guide

## 📱 Tự Động Mở App Khi Đã Cài

Hướng dẫn này giải thích cách setup để **app tự động mở** khi user click vào link và đã cài app.

---

## 🎯 Cách Hoạt Động

### Khi User Click Vào Link:

```
User click: https://dl.fai-x.com/share?productId=ABC123

┌─────────────────────────────────────┐
│   1. iOS/Android kiểm tra domain    │
│      có file verification không?    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   2. Download & verify file:        │
│   • iOS: apple-app-site-association │
│   • Android: assetlinks.json        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   3. Kiểm tra app có cài không?     │
└─────────────────────────────────────┘
              ↓
      ┌───────┴───────┐
      │               │
   ✅ Đã cài       ❌ Chưa cài
      │               │
      ↓               ↓
  🚀 Mở App      🌐 Mở Browser
```

---

## 🍎 iOS - Universal Links Setup

### 1️⃣ Server Side (Backend) - ✅ ĐÃ XONG

File `apple-app-site-association` đã được tạo sẵn:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "EAYXYBF4LF.com.82faix.nfc",
        "paths": [
          "/invite",
          "/invite/*",
          "/share",
          "/share/*",
          "/product/*",
          "/open",
          "/open/*"
        ]
      }
    ]
  }
}
```

**✅ Routes đã được config trong `server.js`:**
- `GET /.well-known/apple-app-site-association`
- `GET /apple-app-site-association`

### 2️⃣ iOS App Side (Frontend)

#### A. Thêm Associated Domains

**File:** `ios/Runner/Runner.entitlements` (Flutter) hoặc Xcode Settings

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.associated-domains</key>
    <array>
        <string>applinks:dl.fai-x.com</string>
        <string>applinks:www.dl.fai-x.com</string>
    </array>
</dict>
</plist>
```

#### B. Xcode Configuration

1. Open project trong Xcode
2. Select target **Runner**
3. Tab **Signing & Capabilities**
4. Click **+ Capability** → **Associated Domains**
5. Add domains:
   ```
   applinks:dl.fai-x.com
   applinks:www.dl.fai-x.com
   ```

#### C. Handle Universal Links trong App

**Flutter:**

```dart
import 'package:uni_links/uni_links.dart';

class DeepLinkService {
  StreamSubscription? _linkSubscription;

  void initialize() {
    // Handle app opened from link
    _linkSubscription = uriLinkStream.listen((Uri? uri) {
      if (uri != null) {
        _handleDeepLink(uri);
      }
    }, onError: (err) {
      print('Error handling deep link: $err');
    });

    // Handle initial link (app launched from link)
    getInitialUri().then((Uri? uri) {
      if (uri != null) {
        _handleDeepLink(uri);
      }
    });
  }

  void _handleDeepLink(Uri uri) {
    print('📱 Deep Link Received: $uri');
    
    // Parse link
    if (uri.path == '/share') {
      final productId = uri.queryParameters['productId'];
      final clickId = uri.queryParameters['clickId'];
      
      if (productId != null) {
        // Navigate to product screen
        navigateToProduct(productId, clickId);
      }
    } else if (uri.path == '/invite') {
      final ref = uri.queryParameters['ref'];
      handleInvite(ref);
    }
  }

  void dispose() {
    _linkSubscription?.cancel();
  }
}
```

**React Native:**

```typescript
import { Linking } from 'react-native';

const handleDeepLink = (event: { url: string }) => {
  const url = event.url;
  console.log('📱 Deep Link Received:', url);
  
  const { path, queryParams } = parseUrl(url);
  
  if (path === '/share') {
    const { productId, clickId } = queryParams;
    if (productId) {
      navigation.navigate('Product', { productId, clickId });
    }
  }
};

// Listen for links
useEffect(() => {
  // App opened from link
  Linking.addEventListener('url', handleDeepLink);
  
  // App launched from link
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink({ url });
    }
  });
  
  return () => {
    Linking.removeEventListener('url', handleDeepLink);
  };
}, []);
```

---

## 🤖 Android - App Links Setup

### 1️⃣ Server Side (Backend) - ⚠️ CẦN CẬP NHẬT

File `.well-known/assetlinks.json` đã được tạo, **nhưng cần thêm SHA-256**:

#### A. Lấy SHA-256 Fingerprint

```bash
# Debug build (development)
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android | \
  grep "SHA256:"
```

**Output:**
```
SHA256: 14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5
```

**Hoặc từ Google Play Console** (recommended cho production):
1. [Google Play Console](https://play.google.com/console)
2. Chọn app → **Setup** → **App Signing**
3. Copy **SHA-256 certificate fingerprint**

📖 **Chi tiết:** Xem file `HOW_TO_GET_SHA256.md`

#### B. Cập Nhật File `.well-known/assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.82faix.nfc",
      "sha256_cert_fingerprints": [
        "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5",
        "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
      ]
    }
  }
]
```

**⚠️ Lưu ý:** Thay thế `YOUR_DEBUG_SHA256_HERE` và `YOUR_RELEASE_SHA256_HERE` bằng SHA-256 thật.

### 2️⃣ Android App Side (Frontend)

#### A. Update AndroidManifest.xml

**File:** `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application>
        <activity
            android:name=".MainActivity"
            android:launchMode="singleTask">
            
            <!-- Existing intent filters -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
            
            <!-- App Links Intent Filter -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                
                <!-- Your domain -->
                <data
                    android:scheme="https"
                    android:host="dl.fai-x.com" />
                
                <!-- Define paths -->
                <data android:pathPrefix="/share" />
                <data android:pathPrefix="/invite" />
                <data android:pathPrefix="/product" />
            </intent-filter>
            
        </activity>
    </application>
</manifest>
```

**🔑 Key Points:**
- ✅ `android:autoVerify="true"` - Bắt buộc cho App Links
- ✅ `android:scheme="https"` - Phải dùng HTTPS
- ✅ `android:host="dl.fai-x.com"` - Domain của bạn
- ✅ `android:launchMode="singleTask"` - Tránh mở nhiều instance

#### B. Handle Deep Links trong App

**Flutter:**

```dart
// Same code as iOS, uni_links package handles both platforms
```

**React Native:**

```typescript
// Same code as iOS, Linking module handles both platforms
```

---

## ✅ Deployment Checklist

### 1. Server Side (Backend)

- [x] File `apple-app-site-association` exists
- [ ] File `.well-known/assetlinks.json` exists với SHA-256 đúng
- [ ] Server phải dùng **HTTPS** (required)
- [ ] Files accessible:
  ```bash
  curl https://dl.fai-x.com/.well-known/apple-app-site-association
  curl https://dl.fai-x.com/.well-known/assetlinks.json
  ```
- [ ] Content-Type: `application/json`
- [ ] No redirects (iOS yêu cầu direct access)

### 2. iOS App

- [ ] Associated Domains capability added
- [ ] Domains configured: `applinks:dl.fai-x.com`
- [ ] Deep link handler implemented
- [ ] App signed with correct provisioning profile

### 3. Android App

- [ ] SHA-256 fingerprint added to assetlinks.json
- [ ] AndroidManifest.xml updated với intent-filter
- [ ] `android:autoVerify="true"` enabled
- [ ] Deep link handler implemented
- [ ] App signed with correct keystore

---

## 🧪 Testing

### iOS Testing

#### A. Test Universal Links

```bash
# 1. Install app on device/simulator
# 2. Open Safari
# 3. Enter URL: https://dl.fai-x.com/share?productId=TEST123
# 4. Should show banner to open in app

# Or use Notes app:
# 1. Create new note
# 2. Type: https://dl.fai-x.com/share?productId=TEST123
# 3. Tap link → should open app
```

#### B. Debug Universal Links

```bash
# Check if file is accessible
curl https://dl.fai-x.com/.well-known/apple-app-site-association

# Validate file format
curl https://dl.fai-x.com/.well-known/apple-app-site-association | python -m json.tool

# Check device logs
# Xcode → Window → Devices and Simulators → View Device Logs
# Search for: "swcd"
```

### Android Testing

#### A. Test App Links

```bash
# Install app
adb install app-release.apk

# Test deep link
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://dl.fai-x.com/share?productId=TEST123"

# Should open app directly (not browser chooser)
```

#### B. Verify App Links Configuration

```bash
# Check if app is verified for domain
adb shell pm get-app-links com.82faix.nfc

# Output should show:
# com.82faix.nfc:
#   ID: xxx
#   Signatures: [xxx]
#   Domain verification state:
#     dl.fai-x.com: verified
```

#### C. Validate assetlinks.json

```bash
# Google's validation tool
curl "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://dl.fai-x.com&relation=delegate_permission/common.handle_all_urls"

# Should return your app's package and fingerprints
```

---

## 🐛 Troubleshooting

### iOS Universal Links Not Working

**Problem:** Link opens in Safari instead of app

**Solutions:**

1. **Check file accessibility:**
   ```bash
   curl -I https://dl.fai-x.com/.well-known/apple-app-site-association
   # Should return 200 OK
   ```

2. **Check file format:**
   - No `.json` extension
   - Content-Type: `application/json`
   - Valid JSON format
   - No redirects

3. **Reinstall app:**
   - iOS caches the file
   - Uninstall → Reinstall app
   - Wait a few minutes

4. **Check domains:**
   - Xcode → Capabilities → Associated Domains
   - Must be `applinks:dl.fai-x.com` (no https://)

5. **Check Team ID:**
   - In `apple-app-site-association`, appID format: `TEAMID.BUNDLEID`
   - Current: `EAYXYBF4LF.com.82faix.nfc`

6. **Test in production:**
   - Universal Links don't work with localhost
   - Must be deployed to HTTPS domain

### Android App Links Not Working

**Problem:** Shows app chooser or opens browser

**Solutions:**

1. **Verify SHA-256:**
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore \
     -alias androiddebugkey -storepass android -keypass android | grep SHA256
   ```
   - Must match assetlinks.json

2. **Check autoVerify:**
   - `android:autoVerify="true"` in AndroidManifest.xml

3. **Reinstall app:**
   - Android verifies on install
   - Uninstall → Reinstall

4. **Check verification status:**
   ```bash
   adb shell pm get-app-links com.82faix.nfc
   ```

5. **Force verification:**
   ```bash
   # Android 12+
   adb shell pm verify-app-links --re-verify com.82faix.nfc
   ```

6. **Check file:**
   ```bash
   curl https://dl.fai-x.com/.well-known/assetlinks.json | python -m json.tool
   ```

7. **Common issues:**
   - Wrong package name
   - Wrong SHA-256
   - File not accessible via HTTPS
   - Missing `android:autoVerify="true"`
   - Wrong scheme (must be `https`)

---

## 📊 Current Status

### ✅ Backend Setup (Server)
- ✅ Express routes configured
- ✅ `apple-app-site-association` file created
- ✅ iOS Universal Links routes enabled
- ⚠️ `.well-known/assetlinks.json` created but **needs SHA-256**
- ✅ Routes handle `/share`, `/invite`, `/product`

### ⚠️ Action Required

1. **Get SHA-256 fingerprint:**
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore \
     -alias androiddebugkey -storepass android -keypass android | grep SHA256
   ```

2. **Update `.well-known/assetlinks.json`:**
   - Replace `YOUR_DEBUG_SHA256_HERE` với debug SHA-256
   - Replace `YOUR_RELEASE_SHA256_HERE` với release SHA-256

3. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Add App Links configuration"
   git push origin main
   ```

4. **Verify files accessible:**
   ```bash
   curl https://your-domain.vercel.app/.well-known/apple-app-site-association
   curl https://your-domain.vercel.app/.well-known/assetlinks.json
   ```

5. **Update mobile apps** với configurations ở trên

6. **Test!**

---

## 🎯 Expected Behavior After Setup

### ✅ Khi User Chưa Cài App:
```
Click link → Browser mở → Landing page → Redirect to Store
```

### ✅ Khi User Đã Cài App:
```
Click link → App mở trực tiếp → Navigate to correct screen
```

**No browser, no redirect, seamless! 🚀**

---

## 📚 Resources

### Official Documentation:
- [iOS Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
- [uni_links Flutter Package](https://pub.dev/packages/uni_links)
- [React Native Linking](https://reactnative.dev/docs/linking)

### Validation Tools:
- [Apple App Site Association Validator](https://search.developer.apple.com/appsearch-validation-tool/)
- [Google Digital Asset Links Validator](https://digitalassetlinks.googleapis.com/v1/statements:list)

### Related Files:
- `HOW_TO_GET_SHA256.md` - Chi tiết về SHA-256
- `docs/INTEGRATION_GUIDE.md` - Full integration guide
- `examples/flutter-example.dart` - Flutter example
- `examples/react-native-example.tsx` - React Native example

---

**Need Help?** Check troubleshooting section or contact team! 🚀

