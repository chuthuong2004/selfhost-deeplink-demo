/**
 * @fileoverview React Native Deep Link Integration Example
 * @description Ví dụ đầy đủ về cách integrate deep linking vào React Native app
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// ==========================================
// CONFIGURATION
// ==========================================

const DEEP_LINK_SERVER = 'https://dl.fai-x.com';
const APP_SCHEME = 'fai-x';

// ==========================================
// DEEP LINK SERVICE
// ==========================================

class DeepLinkService {
  /**
   * Tạo share link cho sản phẩm
   */
  static async generateShareLink(
    productId: string,
    userId?: string,
    ref?: string
  ): Promise<string | null> {
    try {
      const response = await fetch(
        `${DEEP_LINK_SERVER}/api/product/generate-share-link`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId,
            userId,
            ref,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        return data.data.shareLink;
      }

      return null;
    } catch (error) {
      console.error('❌ Error generating share link:', error);
      return null;
    }
  }

  /**
   * Lấy thông tin click từ server
   */
  static async getClickData(clickId: string): Promise<any | null> {
    try {
      const response = await fetch(`${DEEP_LINK_SERVER}/referrer/${clickId}`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      }

      return null;
    } catch (error) {
      console.error('❌ Error fetching click data:', error);
      return null;
    }
  }

  /**
   * Parse deep link URL
   */
  static parseDeepLink(url: string): {
    clickId?: string;
    productId?: string;
    ref?: string;
  } {
    try {
      const urlObj = new URL(url);
      return {
        clickId: urlObj.searchParams.get('clickId') || undefined,
        productId: urlObj.searchParams.get('productId') || undefined,
        ref: urlObj.searchParams.get('ref') || undefined,
      };
    } catch (error) {
      console.error('❌ Error parsing deep link:', error);
      return {};
    }
  }
}

// ==========================================
// DEEP LINK HANDLER HOOK
// ==========================================

/**
 * Custom hook để handle deep links
 */
export const useDeepLinkHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle initial URL (app opened from link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle URL when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async (url: string) => {
    console.log('📎 Deep link received:', url);

    const { clickId, productId, ref } = DeepLinkService.parseDeepLink(url);

    // Nếu có clickId, fetch full data từ server
    if (clickId) {
      const clickData = await DeepLinkService.getClickData(clickId);

      if (clickData) {
        console.log('📊 Click data:', clickData);

        // Navigate based on click data
        if (clickData.productId) {
          navigateToProduct(clickData.productId);
        } else if (clickData.ref) {
          handleReferral(clickData.ref);
        }

        return;
      }
    }

    // Direct navigation nếu có productId trong URL
    if (productId) {
      navigateToProduct(productId);
      return;
    }

    // Handle referral code
    if (ref) {
      handleReferral(ref);
    }
  };

  const navigateToProduct = (productId: string) => {
    console.log('🎁 Navigating to product:', productId);

    // Navigate to product detail screen
    navigation.navigate('ProductDetail', { productId });
  };

  const handleReferral = (refCode: string) => {
    console.log('🎫 Handling referral code:', refCode);

    // Save referral code to local storage
    // Show welcome popup
    // Apply referral benefits

    Alert.alert(
      'Mã giới thiệu',
      `Bạn đã được giới thiệu bởi: ${refCode}`,
      [{ text: 'OK' }]
    );
  };
};

// ==========================================
// PRODUCT SHARE BUTTON COMPONENT
// ==========================================

interface ProductShareButtonProps {
  productId: string;
  productName: string;
  productImage?: string;
}

export const ProductShareButton: React.FC<ProductShareButtonProps> = ({
  productId,
  productName,
  productImage,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    try {
      setIsLoading(true);

      // Generate share link
      const shareLink = await DeepLinkService.generateShareLink(
        productId,
        'USER_ID_HERE', // Replace with actual user ID
        'REF_CODE_HERE' // Replace with actual referral code
      );

      if (!shareLink) {
        Alert.alert('Lỗi', 'Không thể tạo link chia sẻ');
        return;
      }

      // Share using native share dialog
      const result = await Share.share({
        message: `Check out ${productName}! ${shareLink}`,
        url: shareLink, // iOS only
        title: productName,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`✅ Shared via ${result.activityType}`);
        } else {
          console.log('✅ Shared successfully');
        }

        // Optionally show success message
        Alert.alert('Thành công', 'Đã chia sẻ sản phẩm!');
      }
    } catch (error) {
      console.error('❌ Error sharing:', error);
      Alert.alert('Lỗi', 'Không thể chia sẻ sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleShare}
      disabled={isLoading}
      style={{
        backgroundColor: '#667eea',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        opacity: isLoading ? 0.5 : 1,
      }}
      accessibilityLabel="Chia sẻ sản phẩm"
      accessibilityRole="button"
    >
      <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>
        {isLoading ? 'Đang tạo link...' : '🔗 Chia sẻ sản phẩm'}
      </Text>
    </TouchableOpacity>
  );
};

// ==========================================
// PRODUCT DETAIL SCREEN EXAMPLE
// ==========================================

export const ProductDetailScreen = ({ route }: any) => {
  const { productId } = route.params;

  // Use deep link handler
  useDeepLinkHandler();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Product {productId}
      </Text>

      {/* Product info... */}

      <ProductShareButton
        productId={productId}
        productName="Amazing Product"
      />
    </View>
  );
};

// ==========================================
// APP ROOT COMPONENT
// ==========================================

export const App = () => {
  // Initialize deep link handler at app root
  useDeepLinkHandler();

  return (
    // Your app navigation structure
    <View>
      {/* ... */}
    </View>
  );
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Check if deep link can be opened
 */
export const canOpenDeepLink = async (url: string): Promise<boolean> => {
  try {
    return await Linking.canOpenURL(url);
  } catch (error) {
    return false;
  }
};

/**
 * Open deep link
 */
export const openDeepLink = async (url: string): Promise<boolean> => {
  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      console.log(`Cannot open URL: ${url}`);
      return false;
    }
  } catch (error) {
    console.error('Error opening deep link:', error);
    return false;
  }
};

/**
 * Get current app URL scheme
 */
export const getAppScheme = (): string => {
  return APP_SCHEME;
};

// ==========================================
// TESTING HELPERS
// ==========================================

/**
 * Test deep link handling (for development)
 */
export const testDeepLink = (productId: string) => {
  const testUrl = `${APP_SCHEME}://product/${productId}?clickId=test123`;
  console.log('🧪 Testing deep link:', testUrl);
  Linking.openURL(testUrl);
};

/**
 * Get statistics for a product
 */
export const getProductStats = async (productId: string) => {
  try {
    const response = await fetch(
      `${DEEP_LINK_SERVER}/api/product/stats/${productId}`
    );
    const data = await response.json();

    if (data.success) {
      console.log('📊 Product stats:', data.data);
      return data.data;
    }

    return null;
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    return null;
  }
};

