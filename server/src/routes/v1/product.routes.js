// src/routes/v1/product.routes.js
const express = require('express');
const { authenticateUser } = require('../../middleware/auth.middleware');
const router = express.Router();
const admin = require('firebase-admin');



class ProductRoutes {
    constructor(productController) {
        this.productController = productController;
    }

    setupRoutes() {
        /**
         * @swagger
         * /api/v1/users/{userId}/recentlyViewed:
         *   get:
         *     summary: Get recently viewed products for a user
         *     tags: [Products]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: userId
         *         required: true
         *         schema:
         *           type: string
         *         description: Unique identifier of the user
         *     responses:
         *       200:
         *         description: List of recently viewed products
         *       401:
         *         description: Unauthorized
         *       500:
         *         description: Internal server error
         */
        router.get(
            '/users/:userId/recentlyViewed',
            authenticateUser,
            this.productController.getRecentlyViewed
        );

        /**
         * @swagger
         * /api/v1/users/{userId}/recentlyViewed:
         *   post:
         *     summary: Add a product to recently viewed
         *     tags: [Products]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: userId
         *         required: true
         *         schema:
         *           type: string
         *         description: Unique identifier of the user
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - productId
         *             properties:
         *               productId:
         *                 type: string
         *     responses:
         *       200:
         *         description: Product successfully added to recently viewed
         *       401:
         *         description: Unauthorized
         *       500:
         *         description: Internal server error
         */
        router.post(
            '/users/:userId/recentlyViewed',
            authenticateUser,
            this.productController.addRecentlyViewed
        );

        router.get('/products', async (req, res) => {
            try {
                const productsRef = admin.firestore().collection('products');
                const snapshot = await productsRef.get();
                const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                res.status(200).json(products);
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).json({ error: 'Failed to fetch products' });
            }
        });

        router.get('/products/:productId', async (req, res) => {
            try {
                const { productId } = req.params;
                const productRef = admin.firestore().collection('products').doc(productId);
                const productDoc = await productRef.get();

                if (!productDoc.exists) {
                    return res.status(404).json({ error: 'Product not found' });
                }

                res.status(200).json({ id: productDoc.id, ...productDoc.data() });
            } catch (error) {
                console.error('Error fetching product:', error);
                res.status(500).json({ error: 'Failed to fetch product' });
            }
        });

        return router;

    }
}

module.exports = (productController) => {
    const routes = new ProductRoutes(productController);
    return routes.setupRoutes();
};