// src/tests/unit/product.service.test.js

// Create mock chain first
const mockDocRef = {
    set: jest.fn().mockResolvedValue(true),
    collection: jest.fn()
};

const mockCollectionRef = {
    doc: jest.fn(() => mockDocRef)
};

const mockDb = {
    collection: jest.fn(() => mockCollectionRef)
};

// Mock firebase-admin
jest.mock('firebase-admin', () => {
    return {
        credential: {
            cert: jest.fn()
        },
        initializeApp: jest.fn(),
        firestore: jest.fn(() => mockDb)
    };
});

// Mock EmailService
jest.mock('../../services/email.service');

// Mock the firebase config
jest.mock('../../config/firebase.config', () => {
    const admin = require('firebase-admin');
    return {
        admin,
        initializeFirebase: jest.fn()
    };
});

const ProductService = require('../../services/product.service');
const EmailService = require('../../services/email.service');

describe('ProductService', () => {
    let productService;
    let mockCacheService;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup cache service mock
        mockCacheService = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn()
        };

        // Reset mock chain
        mockDocRef.set.mockClear().mockResolvedValue(true);
        mockDocRef.collection.mockClear().mockReturnValue(mockCollectionRef);
        mockCollectionRef.doc.mockClear().mockReturnValue(mockDocRef);
        mockDb.collection.mockClear().mockReturnValue(mockCollectionRef);

        // Setup mock chain implementations
        mockDb.collection.mockImplementation(() => mockCollectionRef);
        mockCollectionRef.doc.mockImplementation(() => mockDocRef);
        mockDocRef.collection.mockImplementation(() => mockCollectionRef);
        mockDocRef.set.mockImplementation(() => Promise.resolve(true));

        productService = new ProductService(mockCacheService);
    });

    describe('addRecentlyViewed', () => {
        it('should add product and update cache', async () => {
            await productService.addRecentlyViewed('userId', 'productId');

            // Verify the chain was called correctly
            expect(mockDb.collection).toHaveBeenCalledWith('users');
            expect(mockCollectionRef.doc).toHaveBeenCalledWith('userId');
            expect(mockDocRef.collection).toHaveBeenCalledWith('recentlyViewed');
            expect(mockCollectionRef.doc).toHaveBeenCalledWith('productId');

            // Verify the set operation
            expect(mockDocRef.set).toHaveBeenCalledWith({
                timestamp: 'SERVER_TIMESTAMP',
                viewCount: 'INCREMENT'
            }, { merge: true });

            // Verify cache was invalidated
            expect(mockCacheService.del).toHaveBeenCalledWith('recentlyViewed:userId');
        });
    });
});