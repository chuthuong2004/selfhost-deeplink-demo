/**
 * @fileoverview Deep link routes - Handles share links and redirects
 * @module routes/deeplink.routes
 * @description Main routes for handling deep link clicks and redirects
 */

import express from 'express';
import productShareService from '../services/product-share.service.js';
import deepLinkService from '../services/deep-link.service.js';
import databaseService from '../services/database.service.js';

const router = express.Router();

/**
 * GET /share
 * Main product share endpoint - handles clicks on share links
 * Query params: productId, shareId, ref, userId, utm_*
 */
router.get('/share', (req, res) => {
  try {
    const {
      productId,
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
    if (!productId) {
      return res.status(400).send('Missing productId parameter');
    }
    
    // Get request metadata
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.socket.remoteAddress || '';
    const platform = deepLinkService.detectPlatform(userAgent);
    
    // Process the share click
    const clickData = productShareService.processShareClick({
      productId,
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
      productId,
    });
    
    console.log(`📱 Redirecting ${platform} user to:`, redirectUrl);
    
    // Redirect user
    res.redirect(redirectUrl);
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
 * Query params: clickId, ref, productId
 */
router.get('/open', (req, res) => {
  try {
    const { clickId, ref, productId } = req.query;
    const userAgent = req.headers['user-agent'] || '';
    const platform = deepLinkService.detectPlatform(userAgent);
    
    // Generate and send landing page HTML
    const html = deepLinkService.generateLandingPageHTML({
      clickId,
      ref,
      productId,
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
    const { clickId, ref } = req.query;
    
    const userAgent = req.headers['user-agent'] || '';
    const platform = deepLinkService.detectPlatform(userAgent);
    
    // If no clickId, create one
    let finalClickId = clickId;
    if (!finalClickId) {
      const ip = req.ip || req.socket.remoteAddress || '';
      const clickData = productShareService.processShareClick({
        productId,
        ref,
        userAgent,
        ip,
        utmParams: {},
      });
      finalClickId = clickData.id;
    }
    
    // Redirect to landing page that will try to open app
    res.redirect(`/open?clickId=${finalClickId}&productId=${productId}${ref ? '&ref=' + encodeURIComponent(ref) : ''}`);
  } catch (error) {
    console.error('❌ Error handling product link:', error);
    res.status(500).send('Error processing product link');
  }
});

export default router;

