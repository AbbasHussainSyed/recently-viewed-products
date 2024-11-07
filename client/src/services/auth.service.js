// src/services/auth.service.js
import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';

export class AuthService {
    static async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();

            // Store token for API calls
            localStorage.setItem('auth_token', token);

            return {
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    emailVerified: userCredential.user.emailVerified
                },
                token
            };
        } catch (error) {
            console.error('Login error:', error);
            throw this.handleAuthError(error);
        }
    }

    static async register(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();

            localStorage.setItem('auth_token', token);

            return {
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    emailVerified: userCredential.user.emailVerified
                },
                token
            };
        } catch (error) {
            console.error('Registration error:', error);
            throw this.handleAuthError(error);
        }
    }

    static async logout() {
        try {
            await firebaseSignOut(auth);
            localStorage.removeItem('auth_token');
        } catch (error) {
            console.error('Logout error:', error);
            throw this.handleAuthError(error);
        }
    }

    static async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Password reset error:', error);
            throw this.handleAuthError(error);
        }
    }

    static async getToken() {
        try {
            const token = localStorage.getItem('auth_token');
            if (token) return token;

            const user = auth.currentUser;
            if (user) {
                const newToken = await user.getIdToken();
                localStorage.setItem('auth_token', newToken);
                return newToken;
            }
            return null;
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }

    static handleAuthError(error) {
        const errorMessage = (() => {
            switch (error.code) {
                case 'auth/user-not-found':
                    return 'No user found with this email address';
                case 'auth/wrong-password':
                    return 'Invalid password';
                case 'auth/email-already-in-use':
                    return 'Email address is already registered';
                case 'auth/weak-password':
                    return 'Password is too weak';
                case 'auth/invalid-email':
                    return 'Invalid email address';
                default:
                    return error.message || 'An unknown error occurred';
            }
        })();

        return new Error(errorMessage);
    }
}