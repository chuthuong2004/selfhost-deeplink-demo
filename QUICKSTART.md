# ⚡ Quick Start Guide

Hướng dẫn nhanh để chạy FAI-X Deep Link Server trong 5 phút.

## 📦 Bước 1: Cài Đặt

```bash
# Clone repository (hoặc đã có sẵn)
cd selfhost-deeplink-demo

# Cài đặt dependencies
npm install
```

## ⚙️ Bước 2: Cấu Hình

```bash
# Copy file .env.example
cp .env.example .env

# (Optional) Chỉnh sửa .env nếu cần
# nano .env
```

File `.env` mặc định đã sẵn sàng cho development. Không cần thay đổi gì!

## 🚀 Bước 3: Chạy Server

```bash
# Development mode (auto-reload)
npm run dev

# Hoặc production mode
npm start
```

✅ Server đang chạy tại `http://localhost:8080`

## 🧪 Bước 4: Test

### Test 1: Health Check

```bash
curl http://localhost:8080/health
```

Kết quả:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45
}
```

### Test 2: Tạo Share Link

```bash
curl -X POST http://localhost:8080/api/product/generate-share-link \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "DEMO123",
    "userId": "USER001",
    "ref": "test2024"
  }'
```

Kết quả:
```json
{
  "success": true,
  "data": {
    "shareId": "uuid-here",
    "shareLink": "https://localhost/share?productId=DEMO123&shareId=...",
    "shortLink": "https://localhost/s/abc123",
    "productId": "DEMO123",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Test 3: Click vào Share Link

Mở trong browser (hoặc dùng curl):

```bash
curl -L "http://localhost:8080/share?productId=DEMO123"
```

Server sẽ:
1. ✅ Lưu click data
2. ✅ Detect platform (iOS/Android/Web)
3. ✅ Redirect tương ứng

### Test 4: Xem Statistics

```bash
# Xem tất cả referrals
curl http://localhost:8080/debug/referrals

# Xem stats tổng quan
curl http://localhost:8080/debug/stats

# Xem stats cho sản phẩm cụ thể
curl http://localhost:8080/api/product/stats/DEMO123
```

## 📱 Bước 5: Test trên Mobile

### Test trên iOS Simulator

```bash
xcrun simctl openurl booted "http://localhost:8080/share?productId=DEMO123"
```

### Test trên Android Emulator/Device

Trước tiên, enable port forwarding:

```bash
# Forward port từ Android device về localhost
adb reverse tcp:8080 tcp:8080

# Test
adb shell am start -W -a android.intent.action.VIEW \
  -d "http://localhost:8080/share?productId=DEMO123"
```

### Test trên Real Device (cùng WiFi)

Server tự động show LAN IP khi start:

```
📱 LAN Access:  http://192.168.1.100:8080
```

Mở link này trên mobile browser:
```
http://192.168.1.100:8080/share?productId=DEMO123
```

## 📊 Bước 6: Monitor

Xem real-time logs trong terminal:

```
🔗 New referral: { id: 'abc123', productId: 'DEMO123', ... }
📱 Redirecting ios user to: /open?clickId=abc123
```

## 🎯 Endpoints Chính

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /share?productId=...` | Share product link |
| `GET /invite?ref=...` | Invite link |
| `GET /product/:id` | Direct product link |
| `GET /referrer/:id` | Get click data |
| `POST /api/product/generate-share-link` | Generate share link |
| `GET /api/product/stats/:id` | Get product stats |
| `GET /debug/referrals` | View all referrals |
| `GET /debug/stats` | View statistics |

## 🔧 Troubleshooting

### Port đã được sử dụng

Thay đổi PORT trong `.env`:
```env
PORT=3000
```

### Data không được lưu

Kiểm tra thư mục `data/`:
```bash
ls -la data/
# Nếu không có, tạo mới:
mkdir -p data
echo '[]' > data/referrals.json
```

### Cannot connect từ mobile

1. Kiểm tra firewall
2. Đảm bảo cùng WiFi network
3. Dùng IP address thay vì `localhost`

## 📚 Next Steps

✅ Server đang chạy local  
➡️ **Tiếp theo**: Integrate vào mobile app

Xem chi tiết:
- [Integration Guide](./docs/INTEGRATION_GUIDE.md) - Full integration guide
- [README](./README.md) - Complete documentation
- [Examples](./examples/) - Code examples

## 💡 Useful Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Clean database
npm run clean

# View logs (if using PM2)
pm2 logs faix-deeplink

# Restart server (if using PM2)
pm2 restart faix-deeplink
```

## 🎉 Done!

Bạn đã sẵn sàng! Server đang chạy và ready để test.

**Tip**: Mở 2 terminal windows:
- Terminal 1: Chạy `npm run dev`
- Terminal 2: Test với `curl` commands

---

Need help? Check [Integration Guide](./docs/INTEGRATION_GUIDE.md) hoặc [README](./README.md)

