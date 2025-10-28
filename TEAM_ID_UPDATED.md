# ✅ Team ID Updated

**Team ID:** `EAYXYBF4LF`
**Bundle ID:** `com.82faix.nfc`
**App ID:** `EAYXYBF4LF.com.82faix.nfc`

## Updated Files

### 1. apple-app-site-association ✅

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

**File này cần được upload lên:**

- `https://dl.fai-x.com/.well-known/apple-app-site-association`
- `https://dl.fai-x.com/apple-app-site-association`

### 2. .env & .env.example ✅

```env
IOS_TEAM_ID=EAYXYBF4LF
IOS_BUNDLE_ID=com.82faix.nfc
```

## Next Steps for iOS Universal Links

### 1. Xcode Configuration

1. Open your Xcode project
2. Select your target → **Signing & Capabilities**
3. Click **+ Capability** → Add **Associated Domains**
4. Add domain:
   ```
   applinks:dl.fai-x.com
   ```

### 2. Verify Team ID in Xcode

- Go to **Signing & Capabilities**
- Under **Team**, verify it shows: **EAYXYBF4LF**
- Bundle Identifier should be: **com.82faix.nfc**

### 3. Upload Association File to Server

Khi deploy production, đảm bảo file `apple-app-site-association` được serve tại:

```bash
# Nginx configuration example
location /.well-known/apple-app-site-association {
    alias /path/to/selfhost-deeplink-demo/apple-app-site-association;
    default_type application/json;
    add_header Content-Type application/json;
}

location /apple-app-site-association {
    alias /path/to/selfhost-deeplink-demo/apple-app-site-association;
    default_type application/json;
    add_header Content-Type application/json;
}
```

### 4. Test Universal Links

#### A. Verify Association File

```bash
# After deploying to server
curl -i https://dl.fai-x.com/.well-known/apple-app-site-association

# Should return:
# - Status: 200 OK
# - Content-Type: application/json
# - Body: JSON with your Team ID
```

#### B. Validate with Apple

Apple will automatically validate your association file when:

1. App is installed on device
2. Device has internet connection
3. File is accessible via HTTPS

Check validation status:

```bash
# On device, check Console app for messages like:
# "swcd: Verified applinks for domain dl.fai-x.com"
```

#### C. Test on Device

**Method 1: Safari**

1. Create test HTML file with link
2. Open in Safari (not in-app browser)
3. Tap link → App should open

**Method 2: Notes/Messages**

1. Send link via iMessage: `https://dl.fai-x.com/share?productId=TEST123`
2. Tap link → App should open

**Method 3: Simulator**

```bash
xcrun simctl openurl booted "https://dl.fai-x.com/share?productId=TEST123"
```

### 5. Troubleshooting

#### Universal Links Not Working?

1. **Clear Cache**

   - Settings → Safari → Clear History and Website Data
   - Delete and reinstall app
2. **Check Team ID**

   ```bash
   # Should show EAYXYBF4LF
   grep -r "EAYXYBF4LF" apple-app-site-association
   ```
3. **Verify HTTPS**

   - Association file MUST be served over HTTPS
   - Certificate must be valid
4. **Check Paths**

   - Paths in association file must match your routes
   - Current paths: `/invite`, `/share`, `/product/*`, `/open`
5. **Validate with Apple's CDN**

   ```bash
   # Apple caches association files
   # Wait 24 hours or:
   curl https://app-site-association.cdn-apple.com/a/v1/dl.fai-x.com
   ```

## iOS App Code Reference

### Setup Deep Link Handler

```swift
// AppDelegate.swift
func application(_ application: UIApplication,
                continue userActivity: NSUserActivity,
                restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
  
    guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
          let url = userActivity.webpageURL else {
        return false
    }
  
    print("📎 Universal Link received: \(url)")
    handleDeepLink(url: url)
    return true
}

private func handleDeepLink(url: URL) {
    let components = URLComponents(url: url, resolvingAgainstBaseURL: true)
  
    let clickId = components?.queryItems?.first(where: { $0.name == "clickId" })?.value
    let productId = components?.queryItems?.first(where: { $0.name == "productId" })?.value
  
    if let clickId = clickId {
        fetchClickData(clickId: clickId) { data in
            if let productId = data["productId"] as? String {
                self.navigateToProduct(productId: productId)
            }
        }
    } else if let productId = productId {
        navigateToProduct(productId: productId)
    }
}
```

## Summary

✅ **Team ID configured:** `EAYXYBF4LF`
✅ **Bundle ID:** `com.82faix.nfc`
✅ **Association file:** Ready to deploy
✅ **Environment files:** Updated

**Next:** Deploy association file lên production server với HTTPS!

---

**Need Help?**

- [Integration Guide](./docs/INTEGRATION_GUIDE.md#ios-integration)
- [Apple Universal Links Docs](https://developer.apple.com/ios/universal-links/)
