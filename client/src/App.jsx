import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth } from './config/firebase';
import ProductDetail from './components/products/ProductDetail';
import ProductPage from './components/products/ProductPage'; // Your product detail component
import { AuthService } from './services/auth.service.js';
import Login from './components/Login';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                localStorage.setItem('auth_token', token);
            } else {
                localStorage.removeItem('auth_token');
            }
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-semibold">My E-Commerce Store</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{user.email}</span>
                        <button
                            onClick={() => AuthService.logout()}
                            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto py-6">
                <Routes>
                    {/* Route for the main product listing */}
                    <Route path="/products" element={<ProductDetail />} />

                    {/* Route for individual product details */}
                    <Route path="/products/:productId" element={<ProductPage />} />

                    {/* Optionally, handle a default route or 404 page */}
                    <Route path="*" element={<div>Page Not Found</div>} />
                </Routes>
            </main>
        </div>
    );
}

export default App;