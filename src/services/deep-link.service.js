/**
 * @fileoverview Deep Link Service - Handles deep link routing and opening
 * @module services/deep-link.service
 * @description Manages deep link generation and platform-specific link handling
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles deep link logic
 * - Open/Closed: Easy to add new link types
 */

import { appConfig, storeConfig, serverConfig } from '../config/app.config.js';

/**
 * Deep Link Service Class
 */
class DeepLinkService {
  /**
   * Generates redirect URL based on platform
   * @param {Object} params - Redirect parameters
   * @param {string} params.platform - Platform (android, ios, web)
   * @param {string} params.clickId - Click ID
   * @param {string} [params.ref] - Reference code
   * @param {string} [params.id] - Resource ID
   * @returns {string} Redirect URL
   */
  generateRedirectUrl({ platform, clickId, ref, id }) {
    switch (platform) {
      case 'android':
        return this._generateAndroidRedirect(clickId, ref, id);
      
      case 'ios':
        return this._generateIOSRedirect(clickId, ref, id);
      
      default:
        return storeConfig.landingPage;
    }
  }

  /**
   * Generates Android redirect URL with Install Referrer
   * @private
   * @param {string} clickId - Click ID
   * @param {string} [ref] - Reference code
   * @param {string} [id] - Resource ID
   * @returns {string} Android Play Store URL
   */
  _generateAndroidRedirect(clickId, ref, id) {
    const url = new URL(storeConfig.android);
    
    // Build referrer parameter for Install Referrer API
    const referrerData = {
      click_id: clickId,
    };
    if (ref) referrerData.ref = ref;
    if (id) referrerData.id = id;
    
    const referrerString = Object.entries(referrerData)
      .map(([key, value]) => `${key}%3D${encodeURIComponent(value)}`)
      .join('%26');
    
    url.searchParams.set('referrer', referrerString);
    
    return url.toString();
  }

  /**
   * Generates iOS redirect URL (to landing page with app opening logic)
   * @private
   * @param {string} clickId - Click ID
   * @param {string} [ref] - Reference code
   * @param {string} [id] - Resource ID
   * @returns {string} Landing page URL
   */
  _generateIOSRedirect(clickId, ref, id) {
    const params = new URLSearchParams({ clickId });
    if (ref) params.set('ref', ref);
    if (id) params.set('id', id);
    
    return `https://${serverConfig.domain}/open?${params.toString()}`;
  }

  /**
   * Generates app opening script for landing page
   * @param {Object} params - Parameters for app opening
   * @returns {string} JavaScript code
   */
  generateAppOpeningScript(params) {
    const { clickId, ref, id, platform } = params;
    
    return `
      (function() {
        const clickId = ${JSON.stringify(clickId || '')};
        const ref = ${JSON.stringify(ref || '')};
        const id = ${JSON.stringify(id || '')};
        const platform = ${JSON.stringify(platform)};
        const appScheme = ${JSON.stringify(appConfig.scheme)};
        const appPackage = ${JSON.stringify(appConfig.package)};
        const storeAndroid = ${JSON.stringify(storeConfig.android)};
        const storeIOS = ${JSON.stringify(storeConfig.ios)};
        
        // Build deep link path
        let deepLinkPath = 'invite';
        if (id) {
          deepLinkPath = 'product/' + id;
        }
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (clickId) queryParams.set('clickId', clickId);
        if (ref) queryParams.set('ref', ref);
        
        const queryString = queryParams.toString();
        
        // Generate different link formats
        const links = {
          customScheme: appScheme + '://' + deepLinkPath + (queryString ? '?' + queryString : ''),
          androidIntent: 'intent://' + deepLinkPath + '?' + queryString + '#Intent;scheme=' + appScheme + ';package=' + appPackage + ';end',
          universalLink: window.location.origin + '/' + deepLinkPath + (queryString ? '?' + queryString : ''),
        };
        
        function fallbackToStore() {
          if (platform === 'android') {
            window.location = storeAndroid;
          } else if (platform === 'ios') {
            window.location = storeIOS;
          } else {
            window.location = '/';
          }
        }
        
        function tryOpenApp() {
          const startTime = Date.now();
          let appOpened = false;
          
          // Listen for visibility change (indicates app opened)
          document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
              appOpened = true;
            }
          });
          
          // Try appropriate method based on platform
          if (platform === 'android') {
            // Android: Use intent (most reliable)
            window.location = links.androidIntent;
          } else if (platform === 'ios') {
            // iOS: Try universal link first, then custom scheme
            window.location = links.universalLink;
            setTimeout(function() {
              if (!appOpened) {
                window.location = links.customScheme;
              }
            }, 500);
          } else {
            // Desktop or unknown: try custom scheme
            window.location = links.customScheme;
          }
          
          // Fallback to store if app didn't open
          setTimeout(function() {
            if (!appOpened && (Date.now() - startTime) < 2000) {
              fallbackToStore();
            }
          }, 1500);
        }
        
        // Auto-trigger on load
        setTimeout(tryOpenApp, 300);
        
        // Also bind to button click if exists
        const openBtn = document.getElementById('openAppBtn');
        if (openBtn) {
          openBtn.addEventListener('click', tryOpenApp);
        }
      })();
    `;
  }

  /**
   * Generates HTML for app opening landing page
   * @param {Object} params - Page parameters
   * @returns {string} HTML content
   */
  generateLandingPageHTML(params) {
    const { id } = params;
    const script = this.generateAppOpeningScript(params);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Open FAI-X App</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      animation: slideUp 0.5s ease-out;
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .logo {
      width: 100px;
      height: 100px;
      margin: 0 auto 24px;
      border-radius: 22px;
      display: block;
      object-fit: contain;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    h1 {
      font-size: 24px;
      color: #1a202c;
      margin-bottom: 12px;
    }
    
    p {
      color: #718096;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    
    .spinner {
      margin: 24px auto;
      width: 50px;
      height: 50px;
      border: 4px solid #e2e8f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      width: 100%;
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
    }
    
    button:active {
      transform: translateY(0);
    }
    
    .info {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }
    
    .info-item {
      font-size: 14px;
      color: #a0aec0;
      margin: 8px 0;
    }
    
    .info-item strong {
      color: #4a5568;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://app-faix.vercel.app/images/logo.png" alt="FAI-X Logo" class="logo">
    <h1>Opening FAI-X App...</h1>
    <p>
      If the app doesn't open automatically, you'll be redirected to the store to install it.
    </p>
    
    <div class="spinner"></div>
    
    <button id="openAppBtn">
      Open App Now
    </button>
    
    ${id ? `
    <div class="info">
      <div class="info-item">
        <strong>Item Tag:</strong> #${id}
      </div>
    </div>
    ` : ''}
  </div>
  
  <script>${script}</script>
</body>
</html>`;
  }

  /**
   * Generates HTML page with SEO meta tags for social sharing
   * @param {Object} params - Page parameters
   * @param {Object} params.metadata - Product metadata (title, description, image, etc.)
   * @param {string} params.redirectUrl - URL to redirect to
   * @param {string} params.id - Product/Resource ID
   * @returns {string} HTML content with meta tags
   */
  generateSharePageHTML({ metadata, redirectUrl, id }) {
    const {
      title = 'My Closet Item | FAI-X',
      description = 'Check out this item from my closet on FAI-X',
      image = 'https://app-faix.vercel.app/images/logo.png',
      url = `https://app-faix.vercel.app/share?id=${id}`,
      siteName = 'FAI-X - Smart Closet',
      type = 'product',
      locale = 'en_US',
    } = metadata;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  
  <!-- Primary Meta Tags -->
  <title>${this._escapeHtml(title)}</title>
  <meta name="title" content="${this._escapeHtml(title)}">
  <meta name="description" content="${this._escapeHtml(description)}">
  <meta name="keywords" content="closet management, wardrobe organizer, NFC tags, fashion, clothing">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${this._escapeHtml(title)}">
  <meta property="og:description" content="${this._escapeHtml(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:locale" content="${locale}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${this._escapeHtml(title)}">
  <meta name="twitter:description" content="${this._escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  
  <!-- Telegram -->
  <meta property="telegram:channel" content="@faix">
  
  <!-- Zalo -->
  <meta property="zalo:image" content="${image}">
  
  <!-- Auto-redirect after page loads (for users, not bots) -->
  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      animation: slideUp 0.5s ease-out;
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .product-image {
      width: 100%;
      max-width: 300px;
      height: auto;
      border-radius: 12px;
      margin-bottom: 24px;
      object-fit: cover;
    }
    
    .logo {
      width: 120px;
      height: 120px;
      margin: 0 auto 24px;
      border-radius: 26px;
      display: block;
      object-fit: contain;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    h1 {
      font-size: 24px;
      color: #1a202c;
      margin-bottom: 12px;
      line-height: 1.4;
    }
    
    p {
      color: #718096;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    
    .spinner {
      margin: 24px auto;
      width: 50px;
      height: 50px;
      border: 4px solid #e2e8f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .redirect-info {
      font-size: 14px;
      color: #a0aec0;
      margin-top: 20px;
    }
    
    .manual-link {
      display: inline-block;
      margin-top: 16px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .manual-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://app-faix.vercel.app/images/logo.png" alt="FAI-X Logo" class="logo">
    <h1>${this._escapeHtml(title)}</h1>
    <p>${this._escapeHtml(description)}</p>
    
    <div class="spinner"></div>
    
    <p class="redirect-info">Redirecting...</p>
    
    <a href="${redirectUrl}" class="manual-link" id="manualLink">
      Click here if not redirected automatically
    </a>
  </div>
  
  <script>
    // Immediate redirect for real users (not bot crawlers)
    (function() {
      const isBot = /bot|crawler|spider|crawling/i.test(navigator.userAgent);
      
      if (!isBot) {
        // Redirect immediately for real users
        setTimeout(function() {
          window.location.href = ${JSON.stringify(redirectUrl)};
        }, 100);
      }
    })();
  </script>
</body>
</html>`;
  }

  /**
   * Escapes HTML special characters
   * @private
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  _escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replaceAll(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Detects platform from user agent
   * @param {string} userAgent - User agent string
   * @returns {string} Platform name
   */
  detectPlatform(userAgent) {
    if (/Android/i.test(userAgent)) return 'android';
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
    return 'web';
  }
}

// Singleton instance
export default new DeepLinkService();

