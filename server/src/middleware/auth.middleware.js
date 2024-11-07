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

const TEST_TOKEN = 'your-test-firebase-token';
const MOCK_USER_ID = 'test-user';

const authenticateUser = async (req, res, next) => {
    try {
        console.log('Auth Headers:', req.headers.authorization);
        const token = req.headers.authorization?.split('Bearer ')[1];

        if (!token) {
            console.log('No token provided');
            throw new AppError(401, 'No authentication token provided');
        }

        // For unit testing with mock token
        if (process.env.NODE_ENV === 'test' && token === TEST_TOKEN) {
            console.log('Test environment: Using mock authentication');
            req.user = { uid: MOCK_USER_ID };
            return next();
        }

        // For development with Firebase testing
        if (process.env.NODE_ENV === 'development') {
            try {
                // First try to verify with Firebase
                const decodedToken = await admin.auth().verifyIdToken(token);
                console.log('Development: Valid Firebase token for user:', decodedToken.uid);
                req.user = decodedToken;
                return next();
            } catch (firebaseError) {
                // If Firebase verification fails, check if it's a test token
                if (token === TEST_TOKEN) {
                    console.log('Development: Using mock token as Firebase verification failed');
                    req.user = { uid: MOCK_USER_ID };
                    return next();
                }
                // If not a test token, let it fall through to the error
                throw firebaseError;
            }
        }

        // Production: Always require valid Firebase token
        console.log('Production: Verifying Firebase token');
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

module.exports = {
    authenticateUser,
    // Export for testing
    TEST_TOKEN,
    MOCK_USER_ID
};