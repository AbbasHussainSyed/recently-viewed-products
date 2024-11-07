// src/services/product.service.js
const { admin } = require('../config/firebase.config');

class ProductService {
    constructor(cacheService, db = admin.firestore()) {
        this.db = db;
        this.cacheService = cacheService;
    }

    async addRecentlyViewed(userId, productId) {
        try {
            // Verify product exists
            const productRef = this.db.collection('products').doc(productId);
            const productDoc = await productRef.get();

            if (!productDoc.exists) {
                throw new Error('Product not found');
            }

            const userRef = this.db.collection('users').doc(userId);
            const recentlyViewedRef = userRef.collection('recentlyViewed').doc(productId);

            // Get the current timestamp
            const timestamp = admin.firestore.FieldValue.serverTimestamp();

            // Transaction to update view count and timestamp
            await this.db.runTransaction(async (transaction) => {
                const doc = await transaction.get(recentlyViewedRef);
                const viewCount = doc.exists ? (doc.data().viewCount || 0) + 1 : 1;

                transaction.set(recentlyViewedRef, {
                    viewCount,
                    timestamp,
                    lastViewed: timestamp
                }, { merge: true });

                // Fetch all recently viewed products and limit to the latest 10
                const recentlyViewedSnapshot = await userRef.collection('recentlyViewed')
                    .orderBy('timestamp', 'desc')
                    .get();

                const recentlyViewedDocs = recentlyViewedSnapshot.docs;
                if (recentlyViewedDocs.length > 10) {
                    const excessDocs = recentlyViewedDocs.slice(10); // Get docs beyond the 10th
                    excessDocs.forEach((doc) => transaction.delete(doc.ref));
                }

                // Update product stats
                const statsRef = this.db.collection('productStats').doc(productId);
                transaction.set(statsRef, {
                    viewCount: admin.firestore.FieldValue.increment(1),
                    lastViewed: timestamp
                }, { merge: true });
            });

            // Invalidate cache
            const cacheKey = `user:${userId}:recentlyViewed`;
            await this.cacheService.del(cacheKey);

            // Update top viewed products cache
            await this.updateTopViewedProducts();

            return { success: true };
        } catch (error) {
            console.error('Error adding recently viewed product:', error);
            throw error;
        }
    }

    async getRecentlyViewed(userId) {
        try {
            // Try cache first
            const cacheKey = `user:${userId}:recentlyViewed`;
            let products = await this.cacheService.get(cacheKey);

            if (products) {
                console.log('Cache hit for recently viewed products');
                return products;
            }

            console.log('Cache miss, fetching from Firestore');
            const userRef = this.db.collection('users').doc(userId);
            const snapshot = await userRef.collection('recentlyViewed')
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();

            products = [];
            const productPromises = snapshot.docs.map(async (doc) => {
                const viewData = doc.data();
                const productDoc = await this.db.collection('products')
                    .doc(doc.id)
                    .get();

                if (productDoc.exists) {
                    return {
                        productId: doc.id,
                        viewCount: viewData.viewCount || 0,
                        timestamp: viewData.timestamp?.toDate?.() || new Date(),
                        productDetails: productDoc.data()
                    };
                }
                return null;
            });

            const resolvedProducts = await Promise.all(productPromises);
            products = resolvedProducts.filter(p => p !== null);

            // Cache the results
            await this.cacheService.set(cacheKey, products, 3600); // Cache for 1 hour

            return products;
        } catch (error) {
            console.error('Error getting recently viewed products:', error);
            throw error;
        }
    }

    async updateTopViewedProducts() {
        try {
            const cacheKey = 'top:viewedProducts';
            const statsSnapshot = await this.db.collection('productStats')
                .orderBy('viewCount', 'desc')
                .limit(10)
                .get();

            const topProducts = [];
            for (const doc of statsSnapshot.docs) {
                const productDoc = await this.db.collection('products').doc(doc.id).get();
                if (productDoc.exists) {
                    topProducts.push({
                        productId: doc.id,
                        viewCount: doc.data().viewCount,
                        ...productDoc.data()
                    });
                }
            }

            // Cache top products
            await this.cacheService.set(cacheKey, topProducts, 3600); // Cache for 1 hour
            return topProducts;
        } catch (error) {
            console.error('Error updating top viewed products:', error);
            throw error;
        }
    }

    async getTopViewedProducts() {
        try {
            const cacheKey = 'top:viewedProducts';
            const cached = await this.cacheService.get(cacheKey);

            if (cached) {
                return cached;
            }

            return await this.updateTopViewedProducts();
        } catch (error) {
            console.error('Error getting top viewed products:', error);
            throw error;
        }
    }
}

module.exports = ProductService;