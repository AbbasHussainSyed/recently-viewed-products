const express = require('express');
const { authenticateUser } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * /users/{userId}/recentlyViewed:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *                 description: Unique identifier of the product
 *     responses:
 *       200:
 *         description: Product successfully added to recently viewed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Product added to recently viewed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

const router = express.Router();

module.exports = (productController) => {
    // Get recently viewed products
    router.get(
        '/users/:userId/recentlyViewed',
        authenticateUser,
        productController.getRecentlyViewed
    );

    // Add product to recently viewed
    router.post(
        '/users/:userId/recentlyViewed',
        authenticateUser,
        productController.addRecentlyViewed
    );

    return router;
};