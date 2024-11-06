// src/services/product.service.js
const { admin } = require('../config/firebase.config');
const EmailService = require('./email.service');

class ProductService {
    constructor(cacheService) {
        // Call firestore() to get the database instance
        this.db = admin.firestore();
        this.cacheService = cacheService;
        this.emailService = new EmailService();
    }

    async addRecentlyViewed(userId, productId) {
        try {
            const userRef = this.db.collection('users').doc(userId);
            const recentlyViewedRef = userRef.collection('recentlyViewed');

            await recentlyViewedRef.doc(productId).set({
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                viewCount: admin.firestore.FieldValue.increment(1)
            }, { merge: true });

            await this.cacheService.del(`recentlyViewed:${userId}`);
            return true;
        } catch (error) {
            console.error('Error adding recently viewed product:', error);
            throw error;
        }
    }
}

module.exports = ProductService;