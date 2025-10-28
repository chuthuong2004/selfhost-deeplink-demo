/**
 * @fileoverview Application configuration centralized module
 * @module config/app.config
 * @description Manages all application configurations from environment variables
 *
 * This module follows SOLID principles:
 * - Single Responsibility: Only handles configuration management
 * - Open/Closed: Easy to extend with new configs without modifying existing code
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

/**
 * Server Configuration
 */
export const serverConfig = {
  port: process.env.PORT || 8080,
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "http://172.16.68.26:8080",
  domain: process.env.DOMAIN || "",
};

/**
 * App Store Configuration
 */
export const storeConfig = {
  android:
    process.env.ANDROID_STORE ||
    "https://play.google.com/store/apps/details?id=com.nfc.faix",
  ios:
    process.env.IOS_STORE || "https://apps.apple.com/us/app/fai-x/id6737755560",
  landingPage: process.env.LANDING_PAGE || "https://fai-x.com/",
};

/**
 * App Configuration
 */
export const appConfig = {
  scheme: process.env.APP_SCHEME || "fai-x",
  package: process.env.APP_PACKAGE || "com.82faix.nfc",
  iosTeamId: process.env.IOS_TEAM_ID || "EAYXYBF4LF",
  iosBundleId: process.env.IOS_BUNDLE_ID || "com.82fai.faix",
};

/**
 * Database Configuration
 */
export const dbConfig = {
  path: process.env.DB_PATH || "./data/referrals.json",
  clickExpiryDays: parseInt(process.env.CLICK_EXPIRY_DAYS || "30", 10),
};

/**
 * Analytics Configuration
 */
export const analyticsConfig = {
  enabled: process.env.ENABLE_ANALYTICS === "true",
  endpoint: process.env.ANALYTICS_ENDPOINT || null,
};

/**
 * Security Configuration
 */
export const securityConfig = {
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  rateLimitMaxRequests: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10
  ),
};

/**
 * Deep Link Configuration
 */
export const deepLinkConfig = {
  paths: {
    invite: "/invite",
    share: "/share",
    product: "/product",
    open: "/open",
    referrer: "/referrer",
  },
};

export default {
  server: serverConfig,
  store: storeConfig,
  app: appConfig,
  db: dbConfig,
  analytics: analyticsConfig,
  security: securityConfig,
  deepLink: deepLinkConfig,
};
