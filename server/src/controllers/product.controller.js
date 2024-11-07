// server/src/controllers/product.controller.js
// src/controllers/product.controller.js
const { AppError } = require('../utils/error.handler');

class ProductController {
    constructor(productService) {
        this.productService = productService;
    }

    getRecentlyViewed = async (req, res, next) => {
        try {
            const { userId } = req.params;
            const user = req.user; // From auth middleware

            console.log('Getting recently viewed:', {
                userId,
                requestUser: user?.uid,
                headers: req.headers
            });

            // Validate user is accessing their own data
            if (userId !== user?.uid) {
                throw new AppError(403, 'Unauthorized access to user data');
            }

            const products = await this.productService.getRecentlyViewed(userId);
            console.log('Retrieved products:', products?.length || 0);

            return res.status(200).json({
                status: 'success',
                data: products || []
            });
        } catch (error) {
            console.error('Error in getRecentlyViewed:', {
                error: error.message,
                stack: error.stack,
                userId: req.params.userId
            });

            if (error instanceof AppError) {
                return next(error);
            }

            next(new AppError(500, 'Failed to fetch recently viewed products'));
        }
    };

    addRecentlyViewed = async (req, res, next) => {
        try {
            const { userId } = req.params;
            const { productId } = req.body;
            const user = req.user; // From auth middleware

            console.log('Adding product view:', {
                userId,
                productId,
                requestUser: user?.uid,
                headers: req.headers
            });

            // Validate request
            if (!productId) {
                throw new AppError(400, 'Product ID is required');
            }

            // Validate user is adding to their own data
            if (userId !== user?.uid) {
                throw new AppError(403, 'Unauthorized access to user data');
            }

            await this.productService.addRecentlyViewed(userId, productId);
            console.log('Successfully recorded product view:', { userId, productId });

            return res.status(200).json({
                status: 'success',
                data: {
                    userId,
                    productId,
                    message: 'Product view recorded successfully'
                }
            });
        } catch (error) {
            console.error('Error in addRecentlyViewed:', {
                error: error.message,
                stack: error.stack,
                userId: req.params.userId,
                productId: req.body.productId
            });

            if (error instanceof AppError) {
                return next(error);
            }

            if (error.message.includes('Product not found')) {
                return next(new AppError(404, 'Product not found'));
            }

            next(new AppError(500, 'Failed to record product view'));
        }
    };
}

module.exports = ProductController;