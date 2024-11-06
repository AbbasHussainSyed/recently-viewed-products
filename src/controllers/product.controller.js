const { AppError } = require('../utils/error.handler');

class ProductController {
    constructor(productService) {
        this.productService = productService;
    }

    getRecentlyViewed = async (req, res, next) => {
        try {
            const { userId } = req.params;

            // Verify user has access to this userId
            if (req.user.uid !== userId) {
                throw new AppError(403, 'Unauthorized access to user data');
            }

            const products = await this.productService.getRecentlyViewed(userId);
            res.json({
                status: 'success',
                data: products
            });
        } catch (error) {
            next(error);
        }
    };

    addRecentlyViewed = async (req, res, next) => {
        try {
            const { userId } = req.params;
            const { productId } = req.body;

            if (!productId) {
                throw new AppError(400, 'Product ID is required');
            }

            // Verify user has access to this userId
            if (req.user.uid !== userId) {
                throw new AppError(403, 'Unauthorized access to user data');
            }

            await this.productService.addRecentlyViewed(userId, productId);
            res.json({
                status: 'success',
                message: 'Product added to recently viewed'
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = ProductController;