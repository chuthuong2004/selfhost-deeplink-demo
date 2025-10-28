/**
 * @fileoverview Rate limiting middleware
 * @module middleware/rate-limiter
 * @description Protects API endpoints from abuse
 */

import { securityConfig } from '../config/app.config.js';

/**
 * Simple in-memory rate limiter
 * In production, use Redis or similar
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.windowMs = securityConfig.rateLimitWindowMs;
    this.maxRequests = securityConfig.rateLimitMaxRequests;
    
    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Middleware function for rate limiting
   */
  middleware = (req, res, next) => {
    const key = this.getKey(req);
    const now = Date.now();
    
    // Get or create request log for this key
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requestLog = this.requests.get(key);
    
    // Filter out old requests outside the time window
    const recentRequests = requestLog.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(this.windowMs / 1000),
      });
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    next();
  };

  /**
   * Gets unique key for the request
   * @param {Object} req - Express request object
   * @returns {string} Unique key
   */
  getKey(req) {
    // Use IP address as key
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  /**
   * Cleans up old entries from memory
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter(
        timestamp => now - timestamp < this.windowMs
      );
      
      if (recentRequests.length === 0) {
        this.requests.delete(key);
        cleaned++;
      } else {
        this.requests.set(key, recentRequests);
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Rate limiter cleaned up ${cleaned} entries`);
    }
  }
}

export default new RateLimiter();

