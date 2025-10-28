/**
 * @fileoverview Database service for managing referral and click data
 * @module services/database.service
 * @description Handles all database operations with JSON file storage
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles database operations
 * - Dependency Inversion: Can be easily replaced with another storage implementation
 */

import fs from 'fs';
import path from 'path';
import { dbConfig } from '../config/app.config.js';

class DatabaseService {
  constructor() {
    this.dbPath = path.resolve(dbConfig.path);
    this.dbDir = path.dirname(this.dbPath);
    this.isServerless = !!process.env.VERCEL;
    
    // Only try to create database files in non-serverless environments
    if (!this.isServerless) {
      this.ensureDbExists();
    }
  }

  /**
   * Ensures database directory and file exist
   * Only works in non-serverless environments (not on Vercel)
   * @private
   */
  ensureDbExists() {
    try {
      if (!fs.existsSync(this.dbDir)) {
        fs.mkdirSync(this.dbDir, { recursive: true });
      }
      if (!fs.existsSync(this.dbPath)) {
        fs.writeFileSync(this.dbPath, JSON.stringify([], null, 2));
      }
    } catch (error) {
      console.error('❌ Error ensuring database exists:', error);
      throw error;
    }
  }

  /**
   * Reads all referrals from database
   * @returns {Array<Object>} Array of referral objects
   */
  readReferrals() {
    try {
      // On serverless (Vercel), database file might not exist
      // Return empty array as default
      if (!fs.existsSync(this.dbPath)) {
        if (this.isServerless) {
          console.warn('⚠️ Database file not found in serverless environment. Returning empty array.');
        }
        return [];
      }
      
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (error) {
      console.error('❌ Error reading referrals:', error);
      return [];
    }
  }

  /**
   * Writes referrals to database
   * On Vercel (serverless), this will fail due to read-only filesystem
   * @param {Array<Object>} data - Array of referral objects
   */
  writeReferrals(data) {
    // Serverless environments have read-only filesystem
    if (this.isServerless) {
      console.warn('⚠️ Cannot write to database in serverless environment (read-only filesystem)');
      console.warn('💡 Consider using external database like MongoDB, PostgreSQL, or Redis for persistence');
      return;
    }
    
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Error writing referrals:', error);
      throw error;
    }
  }

  /**
   * Creates a new referral record
   * @param {Object} referralData - Referral data to save
   * @returns {Object} Created referral object
   */
  createReferral(referralData) {
    const referrals = this.readReferrals();
    referrals.push(referralData);
    this.writeReferrals(referrals);
    return referralData;
  }

  /**
   * Finds a referral by ID
   * @param {string} id - Referral ID to find
   * @returns {Object|null} Referral object or null if not found
   */
  findReferralById(id) {
    const referrals = this.readReferrals();
    return referrals.find(r => r.id === id) || null;
  }

  /**
   * Finds referrals by reference code
   * @param {string} ref - Reference code to search
   * @returns {Array<Object>} Array of matching referrals
   */
  findReferralsByRef(ref) {
    const referrals = this.readReferrals();
    return referrals.filter(r => r.ref === ref);
  }

  /**
   * Updates a referral record
   * @param {string} id - Referral ID to update
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated referral or null if not found
   */
  updateReferral(id, updates) {
    const referrals = this.readReferrals();
    const index = referrals.findIndex(r => r.id === id);
    
    if (index === -1) return null;
    
    referrals[index] = { ...referrals[index], ...updates };
    this.writeReferrals(referrals);
    return referrals[index];
  }

  /**
   * Deletes a referral by ID
   * @param {string} id - Referral ID to delete
   * @returns {boolean} True if deleted, false if not found
   */
  deleteReferral(id) {
    const referrals = this.readReferrals();
    const filtered = referrals.filter(r => r.id !== id);
    
    if (filtered.length === referrals.length) return false;
    
    this.writeReferrals(filtered);
    return true;
  }

  /**
   * Cleans up expired referrals
   * @returns {number} Number of deleted records
   */
  cleanupExpiredReferrals() {
    const referrals = this.readReferrals();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - dbConfig.clickExpiryDays);
    
    const filtered = referrals.filter(r => {
      const referralDate = new Date(r.timestamp);
      return referralDate >= expiryDate;
    });
    
    const deletedCount = referrals.length - filtered.length;
    if (deletedCount > 0) {
      this.writeReferrals(filtered);
      console.log(`🧹 Cleaned up ${deletedCount} expired referrals`);
    }
    
    return deletedCount;
  }

  /**
   * Gets statistics about referrals
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const referrals = this.readReferrals();
    
    return {
      total: referrals.length,
      byPlatform: {
        android: referrals.filter(r => /Android/i.test(r.userAgent)).length,
        ios: referrals.filter(r => /iPhone|iPad|iPod/i.test(r.userAgent)).length,
        other: referrals.filter(r => 
          !/Android|iPhone|iPad|iPod/i.test(r.userAgent)
        ).length,
      },
      recent24h: referrals.filter(r => {
        const day = 24 * 60 * 60 * 1000;
        return Date.now() - new Date(r.timestamp).getTime() < day;
      }).length,
    };
  }
}

// Singleton instance
export default new DatabaseService();

