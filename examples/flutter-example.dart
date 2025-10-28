/**
 * Flutter Deep Link Integration Example
 * Ví dụ đầy đủ về cách integrate deep linking vào Flutter app
 */

import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:uni_links/uni_links.dart';
import 'package:http/http.dart' as http;
import 'package:share_plus/share_plus.dart';

// ==========================================
// CONFIGURATION
// ==========================================

const String DEEP_LINK_SERVER = 'https://dl.fai-x.com';
const String APP_SCHEME = 'fai-x';

// ==========================================
// DEEP LINK SERVICE
// ==========================================

class DeepLinkService {
  StreamSubscription? _sub;

  /// Initialize deep link handling
  void initDeepLinks(BuildContext context) {
    // Handle initial link (app opened from link)
    _handleInitialLink(context);

    // Handle links when app is already open
    _sub = uriLinkStream.listen((Uri? uri) {
      if (uri != null) {
        _handleDeepLink(uri, context);
      }
    }, onError: (err) {
      debugPrint('❌ Deep link error: $err');
    });
  }

  /// Handle initial deep link
  Future<void> _handleInitialLink(BuildContext context) async {
    try {
      final initialUri = await getInitialUri();
      if (initialUri != null) {
        _handleDeepLink(initialUri, context);
      }
    } on PlatformException catch (e) {
      debugPrint('❌ Failed to get initial link: $e');
    }
  }

  /// Handle deep link
  Future<void> _handleDeepLink(Uri uri, BuildContext context) async {
    debugPrint('📎 Deep link received: $uri');

    final clickId = uri.queryParameters['clickId'];
    final productId = uri.queryParameters['productId'];
    final ref = uri.queryParameters['ref'];

    // Fetch full data if we have clickId
    if (clickId != null) {
      try {
        final clickData = await getClickData(clickId);

        if (clickData != null) {
          debugPrint('📊 Click data: $clickData');

          // Navigate based on click data
          if (clickData['productId'] != null) {
            _navigateToProduct(context, clickData['productId']);
          } else if (clickData['ref'] != null) {
            _handleReferral(context, clickData['ref']);
          }

          return;
        }
      } catch (e) {
        debugPrint('❌ Error fetching click data: $e');
      }
    }

    // Direct navigation if productId in URL
    if (productId != null) {
      _navigateToProduct(context, productId);
      return;
    }

    // Handle referral code
    if (ref != null) {
      _handleReferral(context, ref);
    }
  }

  /// Navigate to product detail screen
  void _navigateToProduct(BuildContext context, String productId) {
    debugPrint('🎁 Navigating to product: $productId');

    Navigator.pushNamed(
      context,
      '/product',
      arguments: {'productId': productId},
    );
  }

  /// Handle referral code
  void _handleReferral(BuildContext context, String refCode) {
    debugPrint('🎫 Handling referral code: $refCode');

    // Show dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Mã giới thiệu'),
        content: Text('Bạn đã được giới thiệu bởi: $refCode'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  /// Cleanup
  void dispose() {
    _sub?.cancel();
  }

  // ==========================================
  // API METHODS
  // ==========================================

  /// Generate share link for product
  static Future<String?> generateShareLink({
    required String productId,
    String? userId,
    String? ref,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$DEEP_LINK_SERVER/api/product/generate-share-link'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'productId': productId,
          'userId': userId,
          'ref': ref,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          return data['data']['shareLink'];
        }
      }

      return null;
    } catch (e) {
      debugPrint('❌ Error generating share link: $e');
      return null;
    }
  }

  /// Get click data from server
  static Future<Map<String, dynamic>?> getClickData(String clickId) async {
    try {
      final response = await http.get(
        Uri.parse('$DEEP_LINK_SERVER/referrer/$clickId'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          return data['data'];
        }
      }

      return null;
    } catch (e) {
      debugPrint('❌ Error fetching click data: $e');
      return null;
    }
  }

  /// Get product statistics
  static Future<Map<String, dynamic>?> getProductStats(
      String productId) async {
    try {
      final response = await http.get(
        Uri.parse('$DEEP_LINK_SERVER/api/product/stats/$productId'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          return data['data'];
        }
      }

      return null;
    } catch (e) {
      debugPrint('❌ Error fetching stats: $e');
      return null;
    }
  }
}

// ==========================================
// PRODUCT SHARE BUTTON WIDGET
// ==========================================

class ProductShareButton extends StatefulWidget {
  final String productId;
  final String productName;
  final String? productImage;

  const ProductShareButton({
    Key? key,
    required this.productId,
    required this.productName,
    this.productImage,
  }) : super(key: key);

  @override
  State<ProductShareButton> createState() => _ProductShareButtonState();
}

class _ProductShareButtonState extends State<ProductShareButton> {
  bool _isLoading = false;

  Future<void> _handleShare() async {
    try {
      setState(() => _isLoading = true);

      // Generate share link
      final shareLink = await DeepLinkService.generateShareLink(
        productId: widget.productId,
        userId: 'USER_ID_HERE', // Replace with actual user ID
        ref: 'REF_CODE_HERE', // Replace with actual referral code
      );

      if (shareLink == null) {
        _showError('Không thể tạo link chia sẻ');
        return;
      }

      // Share using native share dialog
      final result = await Share.share(
        'Check out ${widget.productName}! $shareLink',
        subject: widget.productName,
      );

      if (result.status == ShareResultStatus.success) {
        debugPrint('✅ Shared successfully');
        _showSuccess('Đã chia sẻ sản phẩm!');
      }
    } catch (e) {
      debugPrint('❌ Error sharing: $e');
      _showError('Không thể chia sẻ sản phẩm');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: _isLoading ? null : _handleShare,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF667EEA),
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      child: Text(
        _isLoading ? 'Đang tạo link...' : '🔗 Chia sẻ sản phẩm',
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

// ==========================================
// PRODUCT DETAIL SCREEN EXAMPLE
// ==========================================

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({
    Key? key,
    required this.productId,
  }) : super(key: key);

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  Map<String, dynamic>? _stats;
  bool _loadingStats = false;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _loadingStats = true);

    final stats = await DeepLinkService.getProductStats(widget.productId);

    setState(() {
      _stats = stats;
      _loadingStats = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Product ${widget.productId}'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Product ${widget.productId}',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),

            // Product info...
            const Text('Product information here...'),

            const SizedBox(height: 40),

            // Share button
            ProductShareButton(
              productId: widget.productId,
              productName: 'Amazing Product',
            ),

            const SizedBox(height: 40),

            // Statistics
            if (_loadingStats)
              const CircularProgressIndicator()
            else if (_stats != null) ...[
              const Text(
                'Thống kê chia sẻ:',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),
              Text('Tổng clicks: ${_stats!['totalClicks']}'),
              Text('Unique users: ${_stats!['uniqueUsers']}'),
              Text('iOS: ${_stats!['byPlatform']['ios']}'),
              Text('Android: ${_stats!['byPlatform']['android']}'),
            ],
          ],
        ),
      ),
    );
  }
}

// ==========================================
// APP ROOT
// ==========================================

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final DeepLinkService _deepLinkService = DeepLinkService();

  @override
  void initState() {
    super.initState();
    // Initialize deep links after first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _deepLinkService.initDeepLinks(context);
    });
  }

  @override
  void dispose() {
    _deepLinkService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FAI-X App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      routes: {
        '/': (context) => const HomeScreen(),
        '/product': (context) {
          final args = ModalRoute.of(context)!.settings.arguments
              as Map<String, dynamic>;
          return ProductDetailScreen(productId: args['productId']);
        },
      },
    );
  }
}

// ==========================================
// HOME SCREEN
// ==========================================

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FAI-X'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Welcome to FAI-X',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(
                  context,
                  '/product',
                  arguments: {'productId': 'DEMO123'},
                );
              },
              child: const Text('View Demo Product'),
            ),
          ],
        ),
      ),
    );
  }
}

// ==========================================
// MAIN
// ==========================================

void main() {
  runApp(const MyApp());
}

