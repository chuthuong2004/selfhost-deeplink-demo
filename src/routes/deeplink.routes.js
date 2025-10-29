/**
 * @fileoverview Deep link routes - Handles share links and redirects
 * @module routes/deeplink.routes
 * @description Main routes for handling deep link clicks and redirects
 */

import express from 'express';
import productShareService from '../services/product-share.service.js';
import deepLinkService from '../services/deep-link.service.js';
import databaseService from '../services/database.service.js';
import productMetadataService from '../services/product-metadata.service.js';

const router = express.Router();

/**
 * GET /s/:shareId
 * Short link redirect - redirects to full share URL
 * Params: shareId
 */
router.get('/s/:shareId', (req, res) => {
  try {
    const { shareId } = req.params;
    
    // Find the original share data by shareId (stored as id)
    const shareData = databaseService.findReferralById(shareId);
    
    if (!shareData?.productId) {
      // If not found or invalid, return error
      return res.status(404).json({
        success: false,
        error: 'Short link not found or expired',
        shareId,
      });
    }
    
    // Build full share URL with all original parameters
    const params = new URLSearchParams();
    params.set('productId', shareData.productId);
    params.set('shareId', shareId);
    if (shareData.ref) params.set('ref', shareData.ref);
    if (shareData.userId) params.set('userId', shareData.userId);
    
    // Redirect to full share URL
    const fullUrl = `/share?${params.toString()}`;
    console.log(`🔗 Short link redirect: /s/${shareId} → ${fullUrl}`);
    res.redirect(fullUrl);
  } catch (error) {
    console.error('❌ Error handling short link:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing short link',
    });
  }
});

/**
 * GET /share
 * Main product share endpoint - handles clicks on share links with SEO meta tags
 * Query params: id, shareId, ref, userId, utm_*
 */
router.get('/share', (req, res) => {
  try {
    const {
      id,
      shareId,
      ref,
      userId,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    } = req.query;
    
    // Validate required fields
    if (!id) {
      return res.status(400).send('Missing id parameter');
    }
    
    // Get request metadata
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.socket.remoteAddress || '';
    const platform = deepLinkService.detectPlatform(userAgent);
    
    // Process the share click
    const clickData = productShareService.processShareClick({
      productId: id,
      shareId,
      ref,
      userId,
      userAgent,
      ip,
      utmParams: {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
      },
    });
    
    // Generate redirect URL based on platform
    const redirectUrl = deepLinkService.generateRedirectUrl({
      platform,
      clickId: clickData.id,
      ref,
      id,
    });
    
    console.log(`📱 Redirecting ${platform} user to:`, redirectUrl);
    
    // Get product metadata for SEO
    const productMetadata = productMetadataService.getProductMetadata(id);
    
    // Generate HTML page with SEO meta tags
    const html = deepLinkService.generateSharePageHTML({
      metadata: productMetadata,
      redirectUrl,
      id,
    });
    
    // Send HTML response instead of direct redirect
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('❌ Error handling share click:', error);
    res.status(500).send('Error processing share link');
  }
});

/**
 * GET /invite
 * Legacy invite endpoint (for backwards compatibility)
 * Query params: ref, utm_*
 */
router.get('/invite', (req, res) => {
  try {
    const { ref, utm_source, utm_medium, utm_campaign } = req.query;
    
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.socket.remoteAddress || '';
    const platform = deepLinkService.detectPlatform(userAgent);
    
    // Create a generic invite click
    const clickData = productShareService.processShareClick({
      productId: 'invite',
      ref,
      userAgent,
      ip,
      utmParams: {
        utm_source,
        utm_medium,
        utm_campaign,
      },
    });
    
    const redirectUrl = deepLinkService.generateRedirectUrl({
      platform,
      clickId: clickData.id,
      ref,
    });
    
    console.log(`📨 Invite redirect for ${platform}:`, redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Error handling invite:', error);
    res.status(500).send('Error processing invite link');
  }
});

/**
 * GET /open
 * Landing page that attempts to open the app
 * Query params: ref, id
 */
router.get('/open', (req, res) => {
  try {
    const { ref, id } = req.query;
    const userAgent = req.headers['user-agent'] || '';
    const platform = deepLinkService.detectPlatform(userAgent);
    
    // Generate and send landing page HTML
    const html = deepLinkService.generateLandingPageHTML({
      ref,
      id,
      platform,
    });
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('❌ Error generating landing page:', error);
    res.status(500).send('Error loading page');
  }
});

/**
 * GET /referrer/:id
 * API endpoint for apps to retrieve click metadata
 * Used after app install/open to get deferred deep link data
 */
router.get('/referrer/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const referralData = databaseService.findReferralById(id);
    
    if (!referralData) {
      return res.status(404).json({
        success: false,
        error: 'Referral not found or expired',
      });
    }
    
    console.log('📊 Referral data retrieved:', id);
    
    res.json({
      success: true,
      data: referralData,
    });
  } catch (error) {
    console.error('❌ Error fetching referral:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch referral data',
    });
  }
});

/**
 * GET /product/:productId
 * Universal/App Link handler - opens app if installed
 * This route is configured in apple-app-site-association and assetlinks.json
 */
router.get('/product/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const { ref } = req.query;
    
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.socket.remoteAddress || '';
    
    // Track the click
    productShareService.processShareClick({
      productId,
      ref,
      userAgent,
      ip,
      utmParams: {},
    });
    
    // Redirect to landing page that will try to open app
    const redirectUrl = `/open?id=${productId}${ref ? '&ref=' + encodeURIComponent(ref) : ''}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Error handling product link:', error);
    res.status(500).send('Error processing product link');
  }
});

export default router;

