/**
 * @fileoverview Main server application
 * @module server
 * @description Express server for FAI-X deferred deep link system
 * 
 * Architecture:
 * - Modular structure following SOLID principles
 * - Separation of concerns (routes, services, middleware)
 * - Easy to test and maintain
 */

import express from 'express';
import cors from 'cors';
import os from 'node:os';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules fix: Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import configurations
import { serverConfig } from './config/app.config.js';

// Import routes
import productRoutes from './routes/product.routes.js';
import deepLinkRoutes from './routes/deeplink.routes.js';

// Import middleware
import rateLimiter from './middleware/rate-limiter.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

// Import services
import databaseService from './services/database.service.js';

// Initialize Express app
const app = express();

// Trust proxy (important for getting real IP behind reverse proxy)
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to API routes
app.use('/api', rateLimiter.middleware);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Serve apple-app-site-association for iOS Universal Links
app.get('/.well-known/apple-app-site-association', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, '../apple-app-site-association'));
});

app.get('/apple-app-site-association', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, '../apple-app-site-association'));
});

// Serve assetlinks.json for Android App Links
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, '../.well-known/assetlinks.json'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/product', productRoutes);

// Deep Link Routes (main routes)
app.use('/', deepLinkRoutes);

// Debug/Admin routes
app.get('/debug/referrals', (req, res) => {
  try {
    const referrals = databaseService.readReferrals();
    res.json({
      success: true,
      count: referrals.length,
      data: referrals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch referrals',
    });
  }
});

app.get('/debug/stats', (req, res) => {
  try {
    const stats = databaseService.getStatistics();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

/**
 * Gets local IP address for development
 * @returns {string|null} Local IP or null
 */
const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
};

/**
 * Cleanup task - runs periodically
 */
const setupCleanupTask = () => {
  // Run cleanup every 24 hours
  const cleanupInterval = 24 * 60 * 60 * 1000;
  
  setInterval(() => {
    console.log('🧹 Running scheduled cleanup...');
    databaseService.cleanupExpiredReferrals();
  }, cleanupInterval);
  
  console.log('✅ Cleanup task scheduled (every 24 hours)');
};

// Start server
app.listen(serverConfig.port, serverConfig.host, () => {
  const localIp = getLocalIp();
  
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║         🚀 FAI-X Deep Link Server Started            ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log(`🌐 Server:      http://localhost:${serverConfig.port}`);
  
  if (localIp) {
    console.log(`📱 LAN Access:  http://${localIp}:${serverConfig.port}`);
  }
  
  console.log(`🔧 Environment: ${serverConfig.nodeEnv}`);
  console.log(`📊 Domain:      ${serverConfig.domain}`);
  console.log('\n');
  console.log('📍 Available Endpoints:');
  console.log('   GET  /health                  - Health check');
  console.log('   GET  /share?productId=...     - Product share link');
  console.log('   GET  /invite?ref=...          - Invite link');
  console.log('   GET  /open?clickId=...        - App opening page');
  console.log('   GET  /product/:id             - Direct product link');
  console.log('   GET  /referrer/:id            - Get referral data');
  console.log('   POST /api/product/generate-share-link');
  console.log('   GET  /api/product/stats/:id');
  console.log('   GET  /debug/referrals         - View all referrals');
  console.log('   GET  /debug/stats             - View statistics');
  console.log('\n');
  console.log('💡 Example Usage:');
  console.log(`   Share a product: http://localhost:${serverConfig.port}/share?productId=PROD123`);
  console.log(`   Invite link:     http://localhost:${serverConfig.port}/invite?ref=USER456`);
  console.log('\n');
  console.log('✨ Ready to handle deep links!\n');
  
  // Setup periodic cleanup
  setupCleanupTask();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});

