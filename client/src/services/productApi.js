// src/services/api.service.js
import { auth } from '../config/firebase';

class ApiService {
    static async getToken() {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }
        return await user.getIdToken();
    }

    static async request(endpoint, options = {}) {
        try {
            const token = await this.getToken();
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers
            };

            console.log('Making request:', {
                endpoint,
                method: options.method || 'GET',
                headers: { ...headers, Authorization: 'Bearer [HIDDEN]' }
            });

            const response = await fetch(`/api/v1${endpoint}`, {
                ...options,
                headers
            });

            const contentType = response.headers.get('content-type');
            let data;

            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.warn('Response is not JSON:', text);
                    throw new Error('Invalid JSON response from server');
                }
            }

            if (!response.ok) {
                throw new Error(data?.message || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', {
                error: error.message,
                stack: error.stack,
                endpoint
            });
            throw error;
        }
    }

    // Product-related methods
    static async addRecentlyViewed(userId, productId) {
        return this.request(`/users/${userId}/recentlyViewed`, {
            method: 'POST',
            body: JSON.stringify({ productId })
        });
    }

    static async getRecentlyViewed(userId) {
        return this.request(`/users/${userId}/recentlyViewed`);
    }

    static async getTopViewedProducts() {
        return this.request('/products/top-viewed');
    }

    // Auth-related methods
    static async getCurrentUser() {
        const user = auth.currentUser;
        if (!user) return null;

        try {
            const token = await user.getIdToken();
            return {
                uid: user.uid,
                email: user.email,
                token
            };
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Cache-related methods
    static async clearUserCache(userId) {
        return this.request(`/users/${userId}/cache`, {
            method: 'DELETE'
        });
    }

    static async getAllProducts() {
        try {
            const response = await fetch('/api/v1/products'); // Your API endpoint for fetching all products
            if (!response.ok) throw new Error('Failed to fetch all products');
            return response.json();
        } catch (error) {
            console.error('Error fetching all products:', error);
            throw error;
        }
    }

    static async getProductById(productId) {
        try {
            const response = await fetch(`/api/v1/products/${productId}`); // Make sure this endpoint exists in your backend
            if (!response.ok) throw new Error('Failed to fetch product details');
            return await response.json();
        } catch (error) {
            console.error('Error fetching product details:', error);
            throw error;
        }
    }
}

// Error class for API-specific errors
export class ApiError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

export { ApiService };