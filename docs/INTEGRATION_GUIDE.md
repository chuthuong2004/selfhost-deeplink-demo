# 📱 FAI-X Deep Link Integration Guide

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Server Setup](#server-setup)
3. [iOS Integration](#ios-integration)
4. [Android Integration](#android-integration)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)

---

## Tổng Quan

Hệ thống deferred deep link cho phép:
- ✅ Chia sẻ sản phẩm qua link
- ✅ Mở app nếu đã cài đặt
- ✅ Điều hướng đến App Store/Play Store nếu chưa cài
- ✅ Truyền data vào app sau khi cài đặt (deferred deep link)

### Flow Hoạt Động

```
User clicks share link
        ↓
    [Server]
        ↓
   Detect platform
        ↓
    ┌──────────┬──────────┐
    ↓          ↓          ↓
  iOS      Android      Web
    ↓          ↓          ↓
Landing   Intent     Fallback
  Page      URL      Landing
    ↓          ↓
App Opens  App Opens
    ↓          ↓
Fetch click data
    ↓
Navigate to product
```

---

## Server Setup

### 1. Cài Đặt Dependencies

```bash
cd selfhost-deeplink-demo
npm install
```

### 2. Cấu Hình Environment

Tạo file `.env`:

```env
# Server
PORT=8080
NODE_ENV=production
DOMAIN=dl.fai-x.com

# App Store Links
ANDROID_STORE=https://play.google.com/store/apps/details?id=com.nfc.faix
IOS_STORE=https://apps.apple.com/us/app/fai-x/id6737755560

# App Configuration
APP_SCHEME=fai-x
APP_PACKAGE=com.82faix.nfc
IOS_TEAM_ID=YOUR_TEAM_ID
IOS_BUNDLE_ID=com.82faix.nfc

# Landing Page
LANDING_PAGE=https://fai-x.com/
```

### 3. Chạy Server

```bash
# Development
npm run dev

# Production
npm start
```

### 4. Deploy Lên Server

Yêu cầu:
- Domain có HTTPS (bắt buộc cho Universal Links/App Links)
- Node.js >= 16.x
- Reverse proxy (Nginx/Caddy) khuyến nghị

**Nginx Configuration:**

```nginx
server {
    listen 443 ssl http2;
    server_name dl.fai-x.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

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

    # Serve association files
    location /.well-known/apple-app-site-association {
        default_type application/json;
        alias /path/to/selfhost-deeplink-demo/apple-app-site-association;
    }

    location /.well-known/assetlinks.json {
        default_type application/json;
        alias /path/to/selfhost-deeplink-demo/.well-known/assetlinks.json;
    }
}
```

---

## iOS Integration

### 1. Cấu Hình Xcode Project

#### A. Associated Domains

Trong Xcode:
1. Chọn project → Target → Signing & Capabilities
2. Click "+" → Add "Associated Domains"
3. Thêm domain:
   ```
   applinks:dl.fai-x.com
   ```

#### B. URL Schemes

1. Project → Target → Info
2. URL Types → Add new URL Type
3. URL Schemes: `fai-x`
4. Identifier: `com.82faix.nfc`

### 2. Upload `apple-app-site-association`

File phải được host tại:
```
https://dl.fai-x.com/.well-known/apple-app-site-association
https://dl.fai-x.com/apple-app-site-association
```

**Cập nhật file:**
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "YOUR_TEAM_ID.com.82faix.nfc",
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

Thay `YOUR_TEAM_ID` bằng Team ID thực tế.

### 3. Xử Lý Deep Link trong App

#### React Native Example:

**Installation:**
```bash
npm install react-native-branch
# or
npm install @react-native-firebase/dynamic-links
# or use built-in Linking API
```

**App.tsx:**

```typescript
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DEEP_LINK_SERVER = 'https://dl.fai-x.com';

function App() {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle initial URL (app opened from link)
    Linking.getInitialURL().then(handleDeepLink);

    // Handle URL when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  const handleDeepLink = async (url: string | null) => {
    if (!url) return;

    console.log('📎 Deep link received:', url);

    // Parse URL
    const urlObj = new URL(url);
    const clickId = urlObj.searchParams.get('clickId');
    const productId = urlObj.searchParams.get('productId');
    const ref = urlObj.searchParams.get('ref');

    // If we have clickId, fetch full data from server
    if (clickId) {
      try {
        const response = await fetch(`${DEEP_LINK_SERVER}/referrer/${clickId}`);
        const data = await response.json();

        if (data.success) {
          console.log('📊 Click data:', data.data);
          
          // Handle based on data
          if (data.data.productId) {
            navigateToProduct(data.data.productId);
          } else if (data.data.ref) {
            handleReferral(data.data.ref);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching click data:', error);
      }
    }

    // Direct navigation if productId is in URL
    if (productId) {
      navigateToProduct(productId);
    }
  };

  const navigateToProduct = (productId: string) => {
    // Navigate to product screen
    navigation.navigate('ProductDetail', { productId });
  };

  const handleReferral = (refCode: string) => {
    // Handle referral code
    console.log('🎁 Referral code:', refCode);
    // Save to local storage, show popup, etc.
  };

  // Rest of your app...
}
```

#### Flutter Example:

**pubspec.yaml:**
```yaml
dependencies:
  uni_links: ^0.5.1
  http: ^1.1.0
```

**main.dart:**

```dart
import 'package:uni_links/uni_links.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class DeepLinkService {
  static const String DEEP_LINK_SERVER = 'https://dl.fai-x.com';
  
  StreamSubscription? _sub;

  void initDeepLinks(BuildContext context) {
    // Handle initial link (app opened from link)
    getInitialUri().then((uri) {
      if (uri != null) {
        _handleDeepLink(uri, context);
      }
    });

    // Handle links when app is already open
    _sub = uriLinkStream.listen((Uri? uri) {
      if (uri != null) {
        _handleDeepLink(uri, context);
      }
    });
  }

  void _handleDeepLink(Uri uri, BuildContext context) async {
    print('📎 Deep link received: $uri');

    final clickId = uri.queryParameters['clickId'];
    final productId = uri.queryParameters['productId'];
    final ref = uri.queryParameters['ref'];

    // Fetch full data if we have clickId
    if (clickId != null) {
      try {
        final response = await http.get(
          Uri.parse('$DEEP_LINK_SERVER/referrer/$clickId'),
        );

        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          
          if (data['success']) {
            print('📊 Click data: ${data['data']}');
            
            // Handle navigation
            if (data['data']['productId'] != null) {
              _navigateToProduct(context, data['data']['productId']);
            }
          }
        }
      } catch (e) {
        print('❌ Error fetching click data: $e');
      }
    }

    // Direct navigation
    if (productId != null) {
      _navigateToProduct(context, productId);
    }
  }

  void _navigateToProduct(BuildContext context, String productId) {
    Navigator.pushNamed(
      context,
      '/product',
      arguments: {'productId': productId},
    );
  }

  void dispose() {
    _sub?.cancel();
  }
}
```

### 4. Test iOS Deep Links

#### Test Universal Links:
```bash
# Create a test HTML file
echo '<a href="https://dl.fai-x.com/share?productId=TEST123">Open App</a>' > test.html

# Open in Safari on iOS device
# Click the link → App should open
```

#### Test URL Scheme:
```bash
xcrun simctl openurl booted "fai-x://product/TEST123?clickId=abc123"
```

---

## Android Integration

### 1. Cấu Hình Android Manifest

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
                
                <data
                    android:scheme="fai-x"
                    android:host="product" />
                <data
                    android:scheme="fai-x"
                    android:host="invite" />
                <data
                    android:scheme="fai-x"
                    android:host="share" />
            </intent-filter>

            <!-- App Links Intent Filter (Android 6.0+) -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                
                <data
                    android:scheme="https"
                    android:host="dl.fai-x.com"
                    android:pathPrefix="/product" />
                <data
                    android:scheme="https"
                    android:host="dl.fai-x.com"
                    android:pathPrefix="/share" />
                <data
                    android:scheme="https"
                    android:host="dl.fai-x.com"
                    android:pathPrefix="/invite" />
                <data
                    android:scheme="https"
                    android:host="dl.fai-x.com"
                    android:pathPrefix="/open" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### 2. Generate SHA-256 Fingerprint

```bash
# Debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release keystore
keytool -list -v -keystore /path/to/release.keystore -alias your_alias
```

Lấy SHA-256 fingerprint và update vào `.well-known/assetlinks.json`

### 3. Upload `assetlinks.json`

File phải được host tại:
```
https://dl.fai-x.com/.well-known/assetlinks.json
```

**Cập nhật file:**
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.82faix.nfc",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
      ]
    }
  }
]
```

### 4. Xử Lý Deep Link trong Android App

#### React Native Example:

```typescript
// Same as iOS example above - React Native Linking API works for both!
```

#### Native Android (Kotlin) Example:

**MainActivity.kt:**

```kotlin
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

class MainActivity : AppCompatActivity() {
    private val DEEP_LINK_SERVER = "https://dl.fai-x.com"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Handle intent
        handleIntent(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        intent?.let { handleIntent(it) }
    }

    private fun handleIntent(intent: Intent) {
        val action = intent.action
        val data = intent.data

        if (Intent.ACTION_VIEW == action && data != null) {
            handleDeepLink(data)
        }
    }

    private fun handleDeepLink(uri: Uri) {
        println("📎 Deep link received: $uri")

        val clickId = uri.getQueryParameter("clickId")
        val productId = uri.getQueryParameter("productId")
        val ref = uri.getQueryParameter("ref")

        // Fetch full data if we have clickId
        if (clickId != null) {
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val url = URL("$DEEP_LINK_SERVER/referrer/$clickId")
                    val connection = url.openConnection() as HttpURLConnection
                    
                    if (connection.responseCode == 200) {
                        val response = connection.inputStream.bufferedReader().readText()
                        val json = JSONObject(response)
                        
                        if (json.getBoolean("success")) {
                            val data = json.getJSONObject("data")
                            println("📊 Click data: $data")
                            
                            // Handle navigation on main thread
                            runOnUiThread {
                                val prodId = data.optString("productId")
                                if (prodId.isNotEmpty()) {
                                    navigateToProduct(prodId)
                                }
                            }
                        }
                    }
                } catch (e: Exception) {
                    println("❌ Error fetching click data: $e")
                }
            }
        }

        // Direct navigation
        if (productId != null) {
            navigateToProduct(productId)
        }
    }

    private fun navigateToProduct(productId: String) {
        // Navigate to product screen
        // Example: startActivity(Intent(this, ProductDetailActivity::class.java).apply {
        //     putExtra("productId", productId)
        // })
    }
}
```

### 5. Handle Install Referrer (Deferred Deep Link)

**build.gradle:**
```gradle
dependencies {
    implementation 'com.android.installreferrer:installreferrer:2.2'
}
```

**InstallReferrerHandler.kt:**

```kotlin
import com.android.installreferrer.api.InstallReferrerClient
import com.android.installreferrer.api.InstallReferrerStateListener

class InstallReferrerHandler(private val context: Context) {
    
    fun checkInstallReferrer(callback: (String?) -> Unit) {
        val referrerClient = InstallReferrerClient.newBuilder(context).build()
        
        referrerClient.startConnection(object : InstallReferrerStateListener {
            override fun onInstallReferrerSetupFinished(responseCode: Int) {
                when (responseCode) {
                    InstallReferrerClient.InstallReferrerResponse.OK -> {
                        try {
                            val response = referrerClient.installReferrer
                            val referrer = response.installReferrer
                            
                            // Parse referrer: "click_id%3Dabc123%26ref%3Duser456"
                            val clickId = parseClickId(referrer)
                            callback(clickId)
                        } catch (e: Exception) {
                            callback(null)
                        } finally {
                            referrerClient.endConnection()
                        }
                    }
                    else -> {
                        callback(null)
                        referrerClient.endConnection()
                    }
                }
            }

            override fun onInstallReferrerServiceDisconnected() {
                callback(null)
            }
        })
    }

    private fun parseClickId(referrer: String): String? {
        // referrer format: "click_id%3Dabc123%26ref%3Duser456"
        // Decode and parse
        val decoded = URLDecoder.decode(referrer, "UTF-8")
        val params = decoded.split("&")
        
        for (param in params) {
            val (key, value) = param.split("=")
            if (key == "click_id") {
                return value
            }
        }
        
        return null
    }
}

// Usage in MainActivity onCreate:
// InstallReferrerHandler(this).checkInstallReferrer { clickId ->
//     if (clickId != null) {
//         // Fetch deep link data and navigate
//     }
// }
```

### 6. Test Android Deep Links

#### Test App Links:
```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://dl.fai-x.com/share?productId=TEST123"
```

#### Test URL Scheme:
```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "fai-x://product/TEST123?clickId=abc123"
```

#### Verify App Links:
```bash
adb shell dumpsys package d
# Look for your domain and verify status
```

---

## Testing

### 1. Test Share Link Generation

```bash
curl -X POST http://localhost:8080/api/product/generate-share-link \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PROD123",
    "userId": "USER456",
    "ref": "campaign2024"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "shareId": "uuid-here",
    "shareLink": "https://dl.fai-x.com/share?productId=PROD123&shareId=uuid-here&userId=USER456&ref=campaign2024",
    "shortLink": "https://dl.fai-x.com/s/xyz123",
    "productId": "PROD123",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Test Click Tracking

Visit the share link in a mobile browser:
```
https://dl.fai-x.com/share?productId=PROD123&shareId=uuid-here
```

Check server logs for click tracking.

### 3. Test Referrer Data Retrieval

```bash
curl http://localhost:8080/referrer/CLICK_ID
```

### 4. Test Statistics

```bash
curl http://localhost:8080/api/product/stats/PROD123
```

---

## Production Deployment

### 1. Checklist

- [ ] Domain đã có SSL certificate
- [ ] `apple-app-site-association` đã được upload
- [ ] `assetlinks.json` đã được upload  
- [ ] Đã test trên thiết bị thật (iOS & Android)
- [ ] App đã được submit lên App Store & Play Store
- [ ] Environment variables đã được cấu hình đúng
- [ ] Rate limiting đã được bật
- [ ] Monitoring & logging đã được setup

### 2. Environment Variables cho Production

```env
NODE_ENV=production
DOMAIN=dl.fai-x.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_ANALYTICS=true
CLICK_EXPIRY_DAYS=30
```

### 3. PM2 Process Manager (khuyến nghị)

```bash
npm install -g pm2

# Start server
pm2 start src/server.js --name faix-deeplink

# Save config
pm2 save

# Auto-start on reboot
pm2 startup
```

### 4. Monitoring

Monitor các metrics:
- Response time
- Error rate  
- Click-through rate
- Platform distribution
- Conversion rate (app installs)

---

## Troubleshooting

### iOS Universal Links không hoạt động

1. Verify `apple-app-site-association` accessible:
   ```bash
   curl -i https://dl.fai-x.com/.well-known/apple-app-site-association
   ```

2. Check Content-Type là `application/json`

3. Verify Team ID đúng

4. Clear cache trên device: Settings → Safari → Clear History and Website Data

5. Re-install app

### Android App Links không hoạt động

1. Verify `assetlinks.json` accessible:
   ```bash
   curl https://dl.fai-x.com/.well-known/assetlinks.json
   ```

2. Check SHA-256 fingerprint đúng

3. Verify với Google:
   ```
   https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://dl.fai-x.com
   ```

4. Re-install app và test lại

---

## Support

Nếu có vấn đề, liên hệ:
- Email: support@fai-x.com
- GitHub Issues: [repository-url]

