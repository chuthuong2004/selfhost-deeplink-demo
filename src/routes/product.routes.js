/**
 * @fileoverview Product sharing routes
 * @module routes/product.routes
 * @description Handles all product-related deep link endpoints
 */

import express from 'express';
import productShareService from '../services/product-share.service.js';
import deepLinkService from '../services/deep-link.service.js';

const router = express.Router();

/**
 * POST /api/product/generate-share-link
 * Generates a share link for a product
 * 
 * Body:
 * {
 *   productId: string (required)
 *   ref: string (optional)
 *   userId: string (optional)
 *   metadata: object (optional)
 * }
 */
router.post('/generate-share-link', (req, res) => {
  try {
    const { productId, ref, userId, metadata } = req.body;
    
    // Validate required fields
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'productId is required',
      });
    }
    
    // Validate product ID format
    if (!productShareService.validateProductId(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid productId format',
      });
    }
    
    // Generate share link
    const shareLinkData = productShareService.generateShareLink({
      productId,
      ref,
      userId,
      metadata,
    });
    
    console.log('✅ Generated share link:', shareLinkData);
    
    res.json({
      success: true,
      data: shareLinkData,
    });
  } catch (error) {
    console.error('❌ Error generating share link:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate share link',
    });
  }
});

/**
 * GET /api/product/stats/:productId
 * Gets statistics for a specific product
 */
router.get('/stats/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    
    const stats = productShareService.getProductStatistics(productId);
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('❌ Error fetching product stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
});

/**
 * GET /api/product/click/:clickId
 * Retrieves click data by ID
 */
router.get('/click/:clickId', (req, res) => {
  try {
    const { clickId } = req.params;
    
    const clickData = productShareService.getClickData(clickId);
    
    if (!clickData) {
      return res.status(404).json({
        success: false,
        error: 'Click not found or expired',
      });
    }
    
    res.json({
      success: true,
      data: clickData,
    });
  } catch (error) {
    console.error('❌ Error fetching click data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch click data',
    });
  }
});

export default router;

