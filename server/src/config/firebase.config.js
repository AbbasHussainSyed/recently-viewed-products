const admin = require('firebase-admin');
const serviceAccount = require('../../../firebase-key/abbassyed-firebase-service.json');



const initializeFirebase = () => {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase initialized successfully');
        return admin;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
};

module.exports = {
    admin,
    initializeFirebase
};