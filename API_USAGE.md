# 🚀 API Usage Guide - Short Links

## 📝 Tổng Quan

Server cung cấp **API để tạo short links** cho product sharing. Short links giúp:
- ✅ URL ngắn gọn, dễ share
- ✅ Track được clicks và analytics
- ✅ Tự động redirect đến app hoặc store
- ✅ Support Universal Links (iOS) và App Links (Android)

---

## 🔗 Generate Share Link API

### Endpoint
```
POST /api/product/generate-share-link
```

### Request Body
```json
{
  "productId": "PROD123",      // Required: ID của product cần share
  "ref": "USER456",            // Optional: Referral code của user
  "userId": "USER789",         // Optional: ID của user đang share
  "metadata": {                // Optional: Custom data
    "campaign": "summer-sale",
    "source": "instagram"
  }
}
```

### Response
```json
{
  "success": true,
  "data": {
    "shareId": "6250db18-ab0f-4c6a-be4b-df24207f9edc",
    "shareLink": "https://your-domain.com/share?productId=PROD123&shareId=6250db18-ab0f-4c6a-be4b-df24207f9edc&ref=USER456&userId=USER789",
    "shortLink": "https://your-domain.com/s/6250db18-ab0f-4c6a-be4b-df24207f9edc",
    "productId": "PROD123",
    "ref": "USER456",
    "userId": "USER789",
    "metadata": {
      "campaign": "summer-sale",
      "source": "instagram"
    },
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 💻 Code Examples

### JavaScript (Fetch API)
```javascript
const generateShareLink = async (productId, userId, ref) => {
  try {
    const response = await fetch('https://your-domain.com/api/product/generate-share-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        userId,
        ref,
        metadata: {
          source: 'mobile_app',
          campaign: 'referral_program'
        }
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Short Link:', result.data.shortLink);
      console.log('Full Link:', result.data.shareLink);
      
      // Share the short link
      shareToSocialMedia(result.data.shortLink);
    }
  } catch (error) {
    console.error('Error generating link:', error);
  }
};

// Usage
generateShareLink('PROD123', 'USER456', 'REFERRAL789');
```

### TypeScript (Axios)
```typescript
import axios from 'axios';

interface ShareLinkRequest {
  productId: string;
  ref?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface ShareLinkResponse {
  success: boolean;
  data: {
    shareId: string;
    shareLink: string;
    shortLink: string;
    productId: string;
    ref?: string;
    userId?: string;
    metadata?: Record<string, any>;
    createdAt: string;
  };
}

const generateShareLink = async (
  request: ShareLinkRequest
): Promise<ShareLinkResponse> => {
  const { data } = await axios.post<ShareLinkResponse>(
    'https://your-domain.com/api/product/generate-share-link',
    request
  );
  
  return data;
};

// Usage
const result = await generateShareLink({
  productId: 'PROD123',
  userId: 'USER456',
  ref: 'REFERRAL789',
  metadata: {
    campaign: 'summer-sale',
    source: 'instagram'
  }
});

console.log('Short Link:', result.data.shortLink);
```

### Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class DeepLinkService {
  static const String baseUrl = 'https://your-domain.com';
  
  Future<Map<String, dynamic>> generateShareLink({
    required String productId,
    String? userId,
    String? ref,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/product/generate-share-link'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'productId': productId,
          'userId': userId,
          'ref': ref,
          'metadata': metadata,
        }),
      );
      
      if (response.statusCode == 200) {
        final result = json.decode(response.body);
        if (result['success']) {
          print('Short Link: ${result['data']['shortLink']}');
          return result['data'];
        }
      }
      
      throw Exception('Failed to generate share link');
    } catch (e) {
      print('Error: $e');
      rethrow;
    }
  }
}

// Usage
final service = DeepLinkService();
final result = await service.generateShareLink(
  productId: 'PROD123',
  userId: 'USER456',
  ref: 'REFERRAL789',
  metadata: {
    'campaign': 'summer-sale',
    'source': 'mobile_app',
  },
);

// Share the link
Share.share(result['shortLink']);
```

### React Native (TypeScript)
```typescript
import { Share } from 'react-native';

interface GenerateShareLinkParams {
  productId: string;
  userId?: string;
  ref?: string;
  metadata?: Record<string, any>;
}

const generateShareLink = async (
  params: GenerateShareLinkParams
): Promise<string> => {
  try {
    const response = await fetch(
      'https://your-domain.com/api/product/generate-share-link',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      return result.data.shortLink;
    }
    
    throw new Error('Failed to generate share link');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Usage in component
const handleShare = async () => {
  try {
    const shortLink = await generateShareLink({
      productId: 'PROD123',
      userId: currentUser.id,
      ref: currentUser.referralCode,
      metadata: {
        source: 'product_detail_screen',
      },
    });
    
    await Share.share({
      message: `Check out this product! ${shortLink}`,
      url: shortLink,
    });
  } catch (error) {
    console.error('Share failed:', error);
  }
};
```

---

## 🔄 How Short Links Work

### 1. Generate Link
```
POST /api/product/generate-share-link
→ Returns: https://your-domain.com/s/6250db18-ab0f...
```

### 2. User Clicks Short Link
```
GET https://your-domain.com/s/6250db18-ab0f...
→ Server looks up shareId in database
→ Redirects to: /share?productId=PROD123&shareId=...&ref=...
```

### 3. Share Endpoint Processes Click
```
GET /share?productId=PROD123&shareId=...
→ Detects user's platform (iOS/Android/Web)
→ Creates click record in database
→ Redirects to /open page
```

### 4. Open Page Handles Deep Link
```
GET /open?clickId=...&productId=...
→ Attempts to open app (if installed)
→ Falls back to App Store/Play Store (if not installed)
→ Universal Links work automatically (no browser redirect)
```

---

## 📊 Other API Endpoints

### Get Product Statistics
```
GET /api/product/stats/:productId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "PROD123",
    "totalClicks": 156,
    "uniqueUsers": 89,
    "byPlatform": {
      "android": 78,
      "ios": 65,
      "web": 13
    },
    "recentClicks": [...]
  }
}
```

### Get Click Data
```
GET /api/product/click/:clickId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "click-uuid",
    "type": "product_share",
    "productId": "PROD123",
    "shareId": "share-uuid",
    "ref": "USER456",
    "platform": "ios",
    "timestamp": "2025-01-15T10:30:00.000Z",
    "userAgent": "Mozilla/5.0...",
    "ip": "123.456.789.0"
  }
}
```

### Get Referral Data (For App)
```
GET /referrer/:clickId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "click-uuid",
    "productId": "PROD123",
    "ref": "USER456",
    "userId": "USER789",
    "metadata": {...},
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 🧪 Testing

### Using cURL
```bash
# Generate share link
curl -X POST https://your-domain.com/api/product/generate-share-link \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "TEST123",
    "ref": "TESTUSER",
    "metadata": {
      "source": "test"
    }
  }'

# Test short link (will redirect)
curl -L https://your-domain.com/s/6250db18-ab0f...

# Get product stats
curl https://your-domain.com/api/product/stats/TEST123

# Get click data
curl https://your-domain.com/api/product/click/click-uuid
```

### Using Postman

1. **Generate Share Link:**
   - Method: `POST`
   - URL: `https://your-domain.com/api/product/generate-share-link`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "productId": "TEST123",
       "ref": "TESTUSER"
     }
     ```

2. **Copy Short Link** from response

3. **Test Short Link:**
   - Method: `GET`
   - URL: Copy-pasted short link
   - Follow redirects: ✅ ON

---

## 🚨 Error Handling

### Common Errors

#### 400 Bad Request
```json
{
  "success": false,
  "error": "productId is required"
}
```

**Fix:** Ensure `productId` is provided in request body.

#### 404 Not Found
```json
{
  "success": false,
  "error": "Short link not found or expired",
  "shareId": "..."
}
```

**Reasons:**
- Invalid shareId
- Link expired (if cleanup ran)
- Database was reset

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to generate share link"
}
```

**Check:**
- Server logs for detailed error
- Database connection (on Vercel: needs external DB)

---

## ⚠️ Important Notes for Vercel Deployment

### Database Limitation
- ⚠️ **Vercel has read-only filesystem**
- Short links **won't persist** with JSON file storage
- ✅ **Use external database** for production:
  - Vercel KV (Redis) ⭐ Recommended
  - MongoDB Atlas
  - PostgreSQL
  - Supabase

See: `VERCEL_DATABASE_GUIDE.md`

### How It Works Currently:
```
Local Development: ✅ Works (saves to JSON file)
Vercel (without DB): ⚠️ Links generated but NOT saved
                     → Short links will return 404
Vercel (with DB):   ✅ Fully works!
```

---

## 📱 Integration Examples

### In-App Share Button (React Native)
```typescript
import { Share, Button } from 'react-native';

const ProductScreen = ({ product }) => {
  const handleShare = async () => {
    try {
      // Generate share link
      const result = await fetch('https://your-domain.com/api/product/generate-share-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userId: currentUser.id,
          ref: currentUser.referralCode,
        }),
      });
      
      const { data } = await result.json();
      
      // Share using native share dialog
      await Share.share({
        title: product.name,
        message: `Check out ${product.name}! ${data.shortLink}`,
        url: data.shortLink,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };
  
  return (
    <Button title="Share Product" onPress={handleShare} />
  );
};
```

### In-App Share Button (Flutter)
```dart
import 'package:share_plus/share_plus.dart';

class ProductScreen extends StatelessWidget {
  final Product product;
  
  Future<void> _shareProduct() async {
    try {
      final service = DeepLinkService();
      final result = await service.generateShareLink(
        productId: product.id,
        userId: currentUser.id,
        ref: currentUser.referralCode,
      );
      
      await Share.share(
        'Check out ${product.name}! ${result['shortLink']}',
        subject: product.name,
      );
    } catch (e) {
      print('Share failed: $e');
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: _shareProduct,
      child: Text('Share Product'),
    );
  }
}
```

---

## 🔍 Debugging

### Check if Short Link is Saved
```bash
curl https://your-domain.com/debug/referrals
```

Look for records with `type: "share_link_generated"`.

### Check Server Logs
```bash
# Vercel
vercel logs

# Local
# Check terminal where server is running
```

### Test Short Link Redirect
```bash
# Should redirect to /share
curl -L -v https://your-domain.com/s/your-share-id
```

---

## 📚 Related Documentation

- `UNIVERSAL_LINKS_SETUP.md` - Setup Universal Links & App Links
- `VERCEL_DATABASE_GUIDE.md` - Database for Vercel
- `docs/INTEGRATION_GUIDE.md` - Mobile app integration
- `examples/flutter-example.dart` - Flutter code examples
- `examples/react-native-example.tsx` - React Native examples

---

## 💡 Best Practices

1. **Always use shortLink** for sharing (cleaner, trackable)
2. **Include userId and ref** for attribution
3. **Add metadata** for analytics
4. **Handle errors gracefully** in your app
5. **Test with real devices** (iOS and Android)
6. **Use external database** on Vercel
7. **Monitor click statistics** for insights

---

**Need Help?** Check server logs or contact team! 🚀

