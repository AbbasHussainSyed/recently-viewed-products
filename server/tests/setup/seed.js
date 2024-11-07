// server/tests/setup/seed-products.js
const { initializeFirebase } = require('../../src/config/firebase.config');

const sampleProducts = [
    {
        id: 'product6',
        name: 'Premium bag2',
        description: 'High-quality laptop bag',
        price: 599.99,
        imageUrl: 'https://via.placeholder.com/400',
        features: [
            'Active noise cancellation',
            '30-hour battery life',
            'Premium sound quality'
        ],
        category: 'Electronics'
    },
    {
        id: 'product7',
        name: 'Smart tab2',
        description: 'Feature-rich smarttab with health monitoring',
        price: 499.99,
        imageUrl: 'https://via.placeholder.com/400',
        features: [
            'Heart rate monitoring',
            'Sleep tracking',
            'Water resistant'
        ],
        category: 'Electronics'
    },
    {
        id: 'product8',
        name: 'Laptop Backpack-2',
        description: 'Durable laptop backpack with multiple compartments',
        price: 179.99,
        imageUrl: 'https://via.placeholder.com/400',
        features: [
            'Water resistant',
            'Multiple compartments',
            'Padded laptop sleeve'
        ],
        category: 'Accessories'
    },
    {
        id: 'product9',
        name: 'Laptop Backpack-3',
        description: 'Durable laptop backpack with multiple compartments',
        price: 239.99,
        imageUrl: 'https://via.placeholder.com/400',
        features: [
            'Water resistant',
            'Multiple compartments',
            'Padded laptop sleeve'
        ],
        category: 'Accessories'
    },
    {
        id: 'product10',
        name: 'Smart tab3',
        description: 'Feature-rich smarttab with health monitoring',
        price: 599.99,
        imageUrl: 'https://via.placeholder.com/400',
        features: [
            'Heart rate monitoring',
            'Sleep tracking',
            'Water resistant'
        ],
        category: 'Electronics'
    },
];

async function seedProducts() {
    try {
        console.log('Initializing Firebase...');
        const admin = initializeFirebase();
        const db = admin.firestore();

        // Add products
        for (const product of sampleProducts) {
            console.log(`Adding product: ${product.name}`);
            await db.collection('products').doc(product.id).set(product);
            console.log(`Successfully added: ${product.name}`);
        }

        // Add test user and some recently viewed products
        const userId = 'test-user';
        const userRef = db.collection('users').doc(userId);

        for (const product of sampleProducts) {
            console.log(`Adding to recently viewed: ${product.name}`);
            await userRef.collection('recentlyViewed').doc(product.id).set({
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                viewCount: Math.floor(Math.random() * 5) + 1,
                productDetails: product
            });
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedProducts();