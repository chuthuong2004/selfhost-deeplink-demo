# 🔑 Hướng Dẫn Lấy SHA-256 Fingerprint cho Android

## Tại Sao Cần SHA-256?

SHA-256 fingerprint là chữ ký số của certificate Android app. Google dùng nó để verify rằng app của bạn được phép mở links từ domain của bạn (App Links).

---

## 📍 Cách Lấy SHA-256

### Method 1: Debug Keystore (Cho Development)

```bash
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android
```

**Output:**
```
Certificate fingerprints:
SHA1: DA:39:A3:EE:5E:6B:4B:0D:32:55:BF:EF:95:60:18:90:AF:D8:07:09
SHA256: 14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5
```

➡️ **Copy dòng SHA256** (với dấu `:`)

### Method 2: Release Keystore (Cho Production)

```bash
keytool -list -v \
  -keystore /path/to/your/release.keystore \
  -alias your_key_alias
```

**Lưu ý:** 
- Thay `/path/to/your/release.keystore` bằng đường dẫn thật
- Thay `your_key_alias` bằng alias của key
- Nhập password khi được hỏi

### Method 3: Google Play Console (Recommended cho Production)

Nếu app đã được publish lên Google Play Store:

1. Đăng nhập [Google Play Console](https://play.google.com/console)
2. Chọn app **FAI-X**
3. Menu bên trái: **Setup** → **App Signing**
4. Xem section **App signing key certificate**
5. Copy **SHA-256 certificate fingerprint**

**Ưu điểm:** Đây là SHA-256 chính xác mà Google Play dùng để sign app của bạn.

---

## 🔍 Tìm Keystore File

### Debug Keystore Location:

```bash
# macOS/Linux
~/.android/debug.keystore

# Windows
C:\Users\<YourUsername>\.android\debug.keystore
```

### Check nếu file tồn tại:

```bash
# macOS/Linux
ls -la ~/.android/debug.keystore

# Nếu không tồn tại, Android Studio sẽ tự tạo khi build app lần đầu
```

### Release Keystore:

Thường được lưu trong project hoặc nơi bạn tự chọn khi tạo.

**Tìm trong project:**
```bash
# Common locations
android/app/release.keystore
android/release.keystore
~/keystores/faix-release.keystore
```

**Hoặc check trong `build.gradle`:**
```gradle
android {
    signingConfigs {
        release {
            storeFile file("../release.keystore")  // ← Đường dẫn ở đây
            ...
        }
    }
}
```

---

## ✅ Cập Nhật vào assetlinks.json

### Single Fingerprint (Development Only):

```json
{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.82faix.nfc",
    "sha256_cert_fingerprints": [
      "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5"
    ]
  }
}
```

### Multiple Fingerprints (Recommended):

Thêm cả debug và release để test được ở cả 2 môi trường:

```json
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
```

---

## 🧪 Quick Commands

### Get SHA-256 chỉ một dòng (Debug):

```bash
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android | \
  grep "SHA256:"
```

### Get SHA-256 đã format sẵn:

```bash
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android | \
  grep "SHA256:" | \
  awk '{print $2}'
```

### Save to file:

```bash
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android | \
  grep "SHA256:" | \
  awk '{print $2}' > sha256.txt

cat sha256.txt
```

---

## 🔧 Troubleshooting

### Problem 1: "keytool: command not found"

**Solution:** Cài đặt Java JDK

```bash
# Check Java installation
java -version

# If not installed, install JDK
# macOS:
brew install openjdk

# Or download from:
# https://www.oracle.com/java/technologies/downloads/
```

### Problem 2: Debug keystore không tồn tại

**Solution:** Build app một lần trong Android Studio:

1. Open project trong Android Studio
2. Run app (Debug build)
3. Android Studio tự động tạo debug keystore
4. Chạy lại command

### Problem 3: Không biết release keystore password

**Solution:**

- Check file `gradle.properties` hoặc `keystore.properties`
- Hỏi team member tạo keystore
- Nếu quên: Phải tạo keystore mới (nhưng cần update lên Play Store)

### Problem 4: App Links không hoạt động sau khi cập nhật

**Checklist:**
1. ✅ SHA-256 đúng?
2. ✅ File assetlinks.json accessible qua HTTPS?
3. ✅ Package name đúng?
4. ✅ Đã reinstall app sau khi update file?

---

## 📱 React Native Specific

### Tìm keystore trong React Native project:

```bash
# Debug keystore (default)
~/.android/debug.keystore

# Release keystore (thường ở)
android/app/release.keystore
# hoặc
android/release.keystore
```

### Get fingerprint cho React Native:

```bash
cd android

# Debug
./gradlew signingReport

# Hoặc
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey -storepass android -keypass android
```

---

## 📱 Flutter Specific

### Get fingerprint cho Flutter:

```bash
cd android

# Debug
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey -storepass android -keypass android

# Release (check android/key.properties for path)
cat android/key.properties
```

---

## ✅ Verification Steps

### 1. Verify SHA-256 Format

Đúng format:
```
14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5
```

- 64 ký tự hex (0-9, A-F)
- Phân cách bởi dấu `:`
- Tổng cộng 95 ký tự (bao gồm dấu `:`)

### 2. Test assetlinks.json

```bash
# After updating and deploying
curl https://dl.fai-x.com/.well-known/assetlinks.json

# Should return valid JSON with your SHA-256
```

### 3. Validate with Google

```bash
# Google's validator
curl "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://dl.fai-x.com&relation=delegate_permission/common.handle_all_urls"
```

### 4. Test App Links on Device

```bash
# Install app
# Then test:
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://dl.fai-x.com/share?productId=TEST123"

# Check if app opens
```

---

## 📋 Summary

### For Development (Debug Build):

```bash
# 1. Get SHA-256
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey -storepass android -keypass android | \
  grep "SHA256:"

# 2. Copy to assetlinks.json
# 3. Deploy file
# 4. Test
```

### For Production (Release Build):

```bash
# Option A: From release keystore
keytool -list -v -keystore /path/to/release.keystore \
  -alias your_alias | grep "SHA256:"

# Option B: From Google Play Console (Recommended)
# Go to Play Console → App Signing → Copy SHA-256

# Then:
# 1. Update assetlinks.json with BOTH debug and release
# 2. Deploy to production server with HTTPS
# 3. Submit app to Play Store
# 4. Wait for Google to validate
```

---

## 🎯 Next Steps

1. ✅ Get SHA-256 fingerprint (debug hoặc release)
2. ✅ Update `.well-known/assetlinks.json`
3. ✅ Deploy file to server với HTTPS
4. ✅ Test App Links
5. ✅ Submit app to Play Store (nếu chưa)

---

**Need Help?**
- [Google App Links Guide](https://developer.android.com/training/app-links)
- [Android Keystore System](https://developer.android.com/training/articles/keystore)
- [Integration Guide](./docs/INTEGRATION_GUIDE.md#android-integration)

