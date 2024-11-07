const { initializeFirebase } = require('../../src/config/firebase.config');

async function testFirebase() {
    try {
        const admin = initializeFirebase();
        const db = admin.firestore();

        // Test write
        await db.collection('test').doc('test-doc').set({
            message: 'Hello Firebase!',
            timestamp: new Date()
        });

        // Test read
        const doc = await db.collection('test').doc('test-doc').get();
        console.log('Test document data:', doc.data());

        console.log('Firebase test successful!');
    } catch (error) {
        console.error('Firebase test failed:', error);
    }
}

testFirebase();