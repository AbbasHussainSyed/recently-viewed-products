const { admin } = require('../config/firebase.config');
const { AppError } = require('../utils/error.handler');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   responses:
 *     UnauthorizedError:
 *       description: Access token is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 */

const authenticateUser = async (req, res, next) => {
    try {
        console.log('Auth Headers:', req.headers.authorization);
        const token = req.headers.authorization?.split('Bearer ')[1];

        if (!token) {
            console.log('No token provided');
            throw new AppError(401, 'No authentication token provided');
        }
        console.log('Token being verified:', token.substring(0, 20) + '...');


        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('Token verified for user:', decodedToken.uid);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Auth Error:', error);
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(401, 'Authentication failed'));
        }
    }
};

module.exports = { authenticateUser };