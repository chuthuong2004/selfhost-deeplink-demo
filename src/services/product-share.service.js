/**
 * @fileoverview Product Share Service - Handles product sharing deep links
 * @module services/product-share.service
 * @description Manages product sharing functionality with deep link generation
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles product share logic
 * - Open/Closed: Easy to extend with new product types
 * - Dependency Inversion: Depends on abstractions (database service)
 */

import { v4 as uuidv4 } from 'uuid';
import databaseService from './database.service.js';
import { serverConfig, appConfig } from '../config/app.config.js';

/**
 * Product Share Service Class
 */
class ProductShareService {
  /**
   * Generates a share link for a product
   * @param {Object} params - Share parameters
   * @param {string} params.productId - Product ID to share
   * @param {string} [params.ref] - Optional referral code
   * @param {string} [params.userId] - User ID who is sharing
   * @param {Object} [params.metadata] - Additional metadata
   * @returns {Object} Share link data
   */
  generateShareLink({ productId, ref, userId, metadata = {} }) {
    const shareId = uuidv4();
    const baseUrl = `${serverConfig.domain}`;
    
    // Build query parameters
    const params = new URLSearchParams();
    params.set('productId', productId);
    params.set('shareId', shareId);
    if (ref) params.set('ref', ref);
    if (userId) params.set('userId', userId);
    
    // Add custom metadata to params
    Object.entries(metadata).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    
    const shareLink = `https://${baseUrl}/share?${params.toString()}`;
    
    // Create share metadata record in database
    // This allows short links to work by looking up the shareId
    const shareData = {
      id: shareId, // Use shareId as the record ID
      type: 'share_link_generated',
      shareId,
      productId,
      ref: ref || null,
      userId: userId || null,
      metadata,
      timestamp: new Date().toISOString(),
      shortLink: `https://${baseUrl}/s/${shareId}`,
      fullLink: shareLink,
    };
    
    // Save share metadata to database
    databaseService.createReferral(shareData);
    
    console.log('🔗 Generated share link:', { shareId, productId, shortLink: shareData.shortLink });
    
    return {
      shareId,
      shareLink,
      shortLink: `https://${baseUrl}/s/${shareId}`, // Short version
      productId,
      ref,
      userId,
      metadata,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Processes a product share click
   * @param {Object} params - Click parameters
   * @param {string} params.productId - Product ID
   * @param {string} [params.shareId] - Share ID
   * @param {string} [params.ref] - Referral code
   * @param {string} [params.userId] - User ID
   * @param {string} params.userAgent - User agent string
   * @param {string} params.ip - IP address
   * @param {Object} [params.utmParams] - UTM parameters
   * @returns {Object} Click data with ID
   */
  processShareClick({ 
    productId, 
    shareId, 
    ref, 
    userId, 
    userAgent, 
    ip, 
    utmParams = {} 
  }) {
    const clickId = uuidv4();
    
    const clickData = {
      id: clickId,
      type: 'product_share',
      productId,
      shareId: shareId || null,
      ref: ref || null,
      userId: userId || null,
      userAgent,
      ip,
      platform: this._detectPlatform(userAgent),
      timestamp: new Date().toISOString(),
      utmSource: utmParams.utm_source || null,
      utmMedium: utmParams.utm_medium || null,
      utmCampaign: utmParams.utm_campaign || null,
      utmContent: utmParams.utm_content || null,
      utmTerm: utmParams.utm_term || null,
      // Additional product-specific data
      metadata: {
        productId,
        shareId,
      },
    };
    
    // Save to database
    databaseService.createReferral(clickData);
    
    console.log('🎁 Product share click:', {
      clickId,
      productId,
      platform: clickData.platform,
    });
    
    return clickData;
  }

  /**
   * Retrieves click data by ID
   * @param {string} clickId - Click ID
   * @returns {Object|null} Click data or null
   */
  getClickData(clickId) {
    return databaseService.findReferralById(clickId);
  }

  /**
   * Gets statistics for a specific product
   * @param {string} productId - Product ID
   * @returns {Object} Product share statistics
   */
  getProductStatistics(productId) {
    const allReferrals = databaseService.readReferrals();
    const productClicks = allReferrals.filter(r => 
      r.type === 'product_share' && r.productId === productId
    );
    
    return {
      productId,
      totalClicks: productClicks.length,
      uniqueUsers: new Set(productClicks.map(r => r.ip)).size,
      byPlatform: {
        android: productClicks.filter(r => r.platform === 'android').length,
        ios: productClicks.filter(r => r.platform === 'ios').length,
        web: productClicks.filter(r => r.platform === 'web').length,
      },
      recentClicks: productClicks
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10),
    };
  }

  /**
   * Generates deep link URL for app
   * @param {string} productId - Product ID
   * @param {string} clickId - Click ID
   * @param {Object} [additionalParams] - Additional parameters
   * @returns {Object} Deep link URLs for different platforms
   */
  generateDeepLinkUrls(productId, clickId, additionalParams = {}) {
    const baseParams = new URLSearchParams({
      productId,
      clickId,
      ...additionalParams,
    });
    
    return {
      // Custom URL Scheme (iOS & Android)
      customScheme: `${appConfig.scheme}://product/${productId}?${baseParams.toString()}`,
      
      // Android Intent
      androidIntent: `intent://product/${productId}?${baseParams.toString()}#Intent;scheme=${appConfig.scheme};package=${appConfig.package};end`,
      
      // Universal Link (iOS)
      universalLink: `https://${serverConfig.domain}/product/${productId}?${baseParams.toString()}`,
      
      // App Link (Android)
      appLink: `https://${serverConfig.domain}/product/${productId}?${baseParams.toString()}`,
    };
  }

  /**
   * Detects platform from user agent
   * @private
   * @param {string} userAgent - User agent string
   * @returns {string} Platform name
   */
  _detectPlatform(userAgent) {
    if (/Android/i.test(userAgent)) return 'android';
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
    return 'web';
  }

  /**
   * Validates product ID format
   * @param {string} productId - Product ID to validate
   * @returns {boolean} True if valid
   */
  validateProductId(productId) {
    // Add your product ID validation logic
    return productId && productId.length > 0 && productId.length <= 100;
  }

  /**
   * Creates a short link (stub for future implementation)
   * @param {string} shareLink - Full share link
   * @returns {string} Short link
   */
  createShortLink(shareLink) {
    // In production, integrate with a URL shortener service
    // For now, return a simple hash-based short link
    const hash = this._generateHash(shareLink).substring(0, 8);
    return `https://${serverConfig.domain}/s/${hash}`;
  }

  /**
   * Simple hash generator
   * @private
   * @param {string} str - String to hash
   * @returns {string} Hash string
   */
  _generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

// Singleton instance
export default new ProductShareService();

