// src/tests/utils/generate-token.js
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDiyoVxSj-lbBZW9CIIwYkDFtRjPOKuWPo",
    authDomain: "recently-viewed-products-fa8c4.firebaseapp.com",
    projectId: "recently-viewed-products-fa8c4",
    storageBucket: "recently-viewed-products-fa8c4.firebasestorage.app",
    messagingSenderId: "1016552244388",
    appId: "1:1016552244388:web:836a47d49d8f056fb59231",
    measurementId: "G-7V4Y2B533L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function getTestUserToken() {
    try {
        // Test user credentials
        const email = "test@example.com";
        const password = "testpassword123";

        let userCredential;
        try {
            // Try to create new user
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                // If user exists, sign in
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                throw error;
            }
        }

        // Get the token
        const token = await userCredential.user.getIdToken();
        console.log('Your test user ID:', userCredential.user.uid);
        console.log('Your authentication token:', token);

        return {
            userId: userCredential.user.uid,
            token: token
        };
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the function
getTestUserToken();