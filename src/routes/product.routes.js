/**
 * @fileoverview Product sharing routes
 * @module routes/product.routes
 * @description Handles all product-related deep link endpoints
 */

import express from 'express';
import productShareService from '../services/product-share.service.js';

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

/**
 * POST /api/product/update-metadata
 * Updates metadata for a product (for custom SEO)
 * 
 * Body:
 * {
 *   productId: string (required)
 *   title: string (optional)
 *   description: string (optional)
 *   image: string (optional)
 * }
 */
router.post('/update-metadata', (req, res) => {
  try {
    const { productId, title, description, image } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'productId is required',
      });
    }
    
    // TODO: In production, save to database
    // For now, return success with the metadata
    const metadata = {
      productId,
      title: title || `Sản phẩm #${productId} | FAI-X`,
      description: description || `Xem chi tiết sản phẩm ${productId} trên FAI-X`,
      image: image || 'https://app-faix.vercel.app/images/default-share.jpg',
      updatedAt: new Date().toISOString(),
    };
    
    console.log('✅ Updated product metadata:', metadata);
    
    res.json({
      success: true,
      data: metadata,
      message: 'Metadata updated successfully (Note: In-memory only, implement database storage for production)',
    });
  } catch (error) {
    console.error('❌ Error updating metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update metadata',
    });
  }
});

export default router;

