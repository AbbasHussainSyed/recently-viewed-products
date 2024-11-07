// src/tests/unit/product.service.test.js

// Mock firebase-admin first
const mockFieldValue = {
    serverTimestamp: jest.fn().mockReturnValue('SERVER_TIMESTAMP'),
    increment: jest.fn().mockReturnValue('INCREMENT')
};

jest.mock('firebase-admin', () => ({
    credential: {
        cert: jest.fn()
    },
    initializeApp: jest.fn(),
    firestore: jest.fn().mockReturnValue({
        FieldValue: mockFieldValue
    })
}));

// Mock the firebase config
jest.mock('../../src/config/firebase.config', () => ({
    admin: {
        firestore: () => mockDb,
        firestore: {
            FieldValue: mockFieldValue
        }
    }
}));

// Mock EmailService
jest.mock('../../src/services/email.service');

// Create mock chain
const mockQuerySnapshot = {
    forEach: jest.fn(),
    docs: [],
    empty: false
};

const mockDocRef = {
    set: jest.fn().mockResolvedValue(true),
    collection: jest.fn(),
    get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
            viewCount: 3,
            timestamp: new Date()
        })
    })
};

const mockQuery = {
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue(mockQuerySnapshot)
};

const mockCollectionRef = {
    doc: jest.fn(() => mockDocRef),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue(mockQuerySnapshot)
};

const mockDb = {
    collection: jest.fn(() => mockCollectionRef)
};

const ProductService = require('../../src/services/product.service');
const EmailService = require('../../src/services/email.service');

describe('ProductService', () => {
    let productService;
    let mockCacheService;
    let mockEmailService;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup cache service mock
        mockCacheService = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn()
        };

        // Setup email service mock
        mockEmailService = new EmailService();
        mockEmailService.sendMultipleViewsNotification = jest.fn();

        // Reset mock chain
        mockDocRef.set.mockClear().mockResolvedValue(true);
        mockDocRef.collection.mockClear().mockReturnValue(mockCollectionRef);
        mockCollectionRef.doc.mockClear().mockReturnValue(mockDocRef);
        mockDb.collection.mockClear().mockReturnValue(mockCollectionRef);
        mockCollectionRef.orderBy.mockClear().mockReturnThis();
        mockCollectionRef.limit.mockClear().mockReturnThis();
        mockCollectionRef.get.mockClear().mockResolvedValue(mockQuerySnapshot);

        // Initialize ProductService with mockDb
        productService = new ProductService(mockCacheService, mockDb);
        productService.emailService = mockEmailService;
    });

    describe('addRecentlyViewed', () => {
        it('should add product and update cache', async () => {
            const userId = 'userId';
            const productId = 'productId';

            await productService.addRecentlyViewed(userId, productId);

            // Verify the chain was called correctly
            expect(mockDb.collection).toHaveBeenCalledWith('users');
            expect(mockCollectionRef.doc).toHaveBeenCalledWith(userId);
            expect(mockDocRef.collection).toHaveBeenCalledWith('recentlyViewed');

            // Verify the set operation with the mock values
            expect(mockDocRef.set).toHaveBeenCalledWith({
                timestamp: mockFieldValue.serverTimestamp(),
                viewCount: mockFieldValue.increment()
            }, { merge: true });

            // Verify cache was invalidated
            expect(mockCacheService.del).toHaveBeenCalledWith(`recentlyViewed:${userId}`);
        });

        it('should handle errors properly', async () => {
            mockDocRef.set.mockRejectedValue(new Error('Firebase error'));

            await expect(productService.addRecentlyViewed('userId', 'productId'))
                .rejects
                .toThrow('Firebase error');
        });

        it('should throw error for invalid input', async () => {
            mockDocRef.set.mockRejectedValue(new Error('Invalid input'));

            await expect(productService.addRecentlyViewed(null, 'productId'))
                .rejects
                .toThrow('Invalid input');
        });
    });

    describe('getRecentlyViewed', () => {
        it('should return cached products if available', async () => {
            const cachedProducts = [{ id: 'product1' }];
            mockCacheService.get.mockResolvedValue(cachedProducts);

            const result = await productService.getRecentlyViewed('userId');

            expect(result).toEqual(cachedProducts);
            expect(mockCacheService.get).toHaveBeenCalledWith('recentlyViewed:userId');
        });

        it('should fetch from Firestore if cache is empty', async () => {
            mockCacheService.get.mockResolvedValue(null);
            const mockProducts = [
                { id: 'product1', timestamp: new Date() },
                { id: 'product2', timestamp: new Date() }
            ];

            mockQuerySnapshot.forEach.mockImplementation((callback) => {
                mockProducts.forEach((product) => {
                    callback({
                        id: product.id,
                        data: () => ({ timestamp: product.timestamp })
                    });
                });
            });

            const result = await productService.getRecentlyViewed('userId');

            expect(result).toHaveLength(mockProducts.length);
            expect(mockCollectionRef.orderBy).toHaveBeenCalledWith('timestamp', 'desc');
            expect(mockCollectionRef.limit).toHaveBeenCalledWith(10);
            expect(mockCacheService.set).toHaveBeenCalled();
        });

        it('should handle empty results from Firestore', async () => {
            mockCacheService.get.mockResolvedValue(null);
            mockQuerySnapshot.empty = true;
            mockQuerySnapshot.forEach.mockImplementation(() => {});

            const result = await productService.getRecentlyViewed('userId');

            expect(result).toEqual([]);
        });

        it('should handle Firestore errors', async () => {
            mockCacheService.get.mockResolvedValue(null);
            mockCollectionRef.get.mockRejectedValue(new Error('Firestore error'));

            await expect(productService.getRecentlyViewed('userId'))
                .rejects
                .toThrow('Firestore error');
        });
    });

    describe('checkMultipleViews', () => {
        it('should send notification when product is viewed multiple times', async () => {
            const userId = 'testUser';
            const productId = 'testProduct';
            const userEmail = 'test@example.com';

            const mockDocData = {
                exists: true,
                data: () => ({
                    viewCount: 3,
                    timestamp: new Date()
                })
            };
            mockDocRef.get.mockResolvedValue(mockDocData);

            await productService.checkMultipleViews(userId, productId, userEmail);

            expect(mockEmailService.sendMultipleViewsNotification).toHaveBeenCalledWith(
                userEmail,
                expect.objectContaining({
                    productId,
                    viewCount: 3
                })
            );
        });

        it('should not send notification when view count is low', async () => {
            const mockDocData = {
                exists: true,
                data: () => ({
                    viewCount: 2,
                    timestamp: new Date()
                })
            };
            mockDocRef.get.mockResolvedValue(mockDocData);

            await productService.checkMultipleViews('userId', 'productId', 'test@example.com');

            expect(mockEmailService.sendMultipleViewsNotification).not.toHaveBeenCalled();
        });

        it('should handle non-existent documents', async () => {
            mockDocRef.get.mockResolvedValue({ exists: false });

            await productService.checkMultipleViews('userId', 'productId', 'test@example.com');

            expect(mockEmailService.sendMultipleViewsNotification).not.toHaveBeenCalled();
        });

        it('should handle errors during check', async () => {
            mockDocRef.get.mockRejectedValue(new Error('Database error'));

            await expect(productService.checkMultipleViews('userId', 'productId', 'test@example.com'))
                .rejects
                .toThrow('Database error');
        });
    });
});