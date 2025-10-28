# ✅ Android App Links Configured

**Package Name:** `com.82faix.nfc`  
**SHA-256 Fingerprint:** `BF:10:0A:D4:1C:DA:A0:2B:7C:85:B9:32:E1:91:79:99:A6:21:70:27:D7:8B:62:01:09:72:29:83:78:82:23:E3`

## 📱 Configuration Complete

File `.well-known/assetlinks.json` đã được cấu hình:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.82faix.nfc",
      "sha256_cert_fingerprints": [
        "BF:10:0A:D4:1C:DA:A0:2B:7C:85:B9:32:E1:91:79:99:A6:21:70:27:D7:8B:62:01:09:72:29:83:78:82:23:E3"
      ]
    }
  }
]
```

---

## 🚀 Next Steps

### 1. Deploy File to Production Server

File này phải được serve tại:
```
https://yourdomain.com/.well-known/assetlinks.json
```

**Nginx Configuration:**
```nginx
location /.well-known/assetlinks.json {
    alias /path/to/selfhost-deeplink-demo/.well-known/assetlinks.json;
    default_type application/json;
    add_header Content-Type application/json;
    add_header Access-Control-Allow-Origin *;
}
```

### 2. Verify File Accessibility

```bash
# After deploying
curl -i https://yourdomain.com/.well-known/assetlinks.json

# Should return:
# - Status: 200 OK
# - Content-Type: application/json
# - Body: JSON with your SHA-256
```

### 3. Validate with Google

```bash
# Google's Digital Asset Links validator
curl "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://yourdomain.com&relation=delegate_permission/common.handle_all_urls"
```

### 4. Configure Android App

**AndroidManifest.xml:**

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.82faix.nfc">

    <application>
        <activity
            android:name=".MainActivity"
            android:launchMode="singleTask">
            
            <!-- URL Scheme Intent Filter -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                
                <data android:scheme="fai-x" />
            </intent-filter>

            <!-- App Links Intent Filter -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                
                <data
                    android:scheme="https"
                    android:host="yourdomain.com"
                    android:pathPrefix="/product" />
                <data
                    android:scheme="https"
                    android:host="yourdomain.com"
                    android:pathPrefix="/share" />
                <data
                    android:scheme="https"
                    android:host="yourdomain.com"
                    android:pathPrefix="/invite" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

**Important:** Thay `yourdomain.com` bằng domain thực tế!

---

## 🧪 Testing

### Test 1: Verify Package Name

```bash
# Get package name from installed app
adb shell pm list packages | grep faix

# Should show: package:com.82faix.nfc
```

### Test 2: Test URL Scheme

```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "fai-x://product/TEST123?clickId=abc123"
```

### Test 3: Test App Links

```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://yourdomain.com/share?productId=TEST123"
```

### Test 4: Verify App Links Status

```bash
# Check if App Links are verified
adb shell dumpsys package d

# Look for your domain and check status:
# - "verified" = ✅ Working
# - "ask" or "always-ask" = ❌ Need to fix
```

---

## 🔧 Troubleshooting

### App Links Not Working?

**1. Check assetlinks.json is accessible:**
```bash
curl https://yourdomain.com/.well-known/assetlinks.json
```

**2. Verify SHA-256 is correct:**
```bash
keytool -list -v -keystore path/to/keystore \
  -alias your_alias | grep SHA256
```

**3. Clear and reinstall app:**
```bash
adb uninstall com.82faix.nfc
adb install path/to/your.apk
```

**4. Check Android version:**
- App Links require Android 6.0 (API 23) or higher
- `autoVerify="true"` requires Android 6.0+

**5. Wait for verification:**
- Android verifies assetlinks.json in background
- Can take a few minutes after install
- Check: `adb logcat | grep -i "digital asset"`

---

## 📊 Configuration Summary

| Item | Value | Status |
|------|-------|--------|
| Package Name | `com.82faix.nfc` | ✅ |
| SHA-256 | `BF:10:0A:...` | ✅ |
| iOS Team ID | `EAYXYBF4LF` | ✅ |
| iOS Bundle ID | `com.82faix.nfc` | ✅ |
| assetlinks.json | Configured | ✅ |
| apple-app-site-association | Configured | ✅ |
| Server Code | Ready | ✅ |

---

## 🎯 Production Checklist

- [x] SHA-256 fingerprint added
- [x] Package name correct
- [ ] Deploy assetlinks.json to production server (HTTPS)
- [ ] Verify file accessible via curl
- [ ] Update AndroidManifest.xml with domain
- [ ] Test App Links on real device
- [ ] Submit app to Play Store
- [ ] Wait for Google verification
- [ ] Monitor logs for verification status

---

## 📱 React Native / Flutter Setup

### React Native

File `.well-known/assetlinks.json` đã sẵn sàng!

**android/app/src/main/AndroidManifest.xml** đã có đủ config chưa?

### Flutter

File `.well-known/assetlinks.json` đã sẵn sàng!

**android/app/src/main/AndroidManifest.xml** đã có đủ config chưa?

---

## 🔗 Useful Links

- [Android App Links Guide](https://developer.android.com/training/app-links)
- [Digital Asset Links](https://developers.google.com/digital-asset-links)
- [Google DAL Validator](https://digitalassetlinks.googleapis.com/v1/statements:list)
- [Integration Guide](./docs/INTEGRATION_GUIDE.md)

---

**Status: ✅ Android Configuration Complete!**

Next: Deploy to production server với HTTPS!
