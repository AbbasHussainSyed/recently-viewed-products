import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../services/productApi.js';
import { auth } from '../../config/firebase';
import RecentlyViewedCarousel from './RecentlyViewedProducts.jsx';

const ProductDetail = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const navigate = useNavigate();

    const loadAllProducts = useCallback(async () => {
        try {
            const allProductsData = await ApiService.getAllProducts();
            setAllProducts(allProductsData);
        } catch (error) {
            console.error('Error loading all products:', error);
        }
    }, []);

    const loadRecentlyViewed = useCallback(async () => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Please login to view products');

            const recentResult = await ApiService.getRecentlyViewed(user.uid);
            console.log('Recently viewed products:', recentResult.data);
            setRecentProducts(recentResult.data || []);
        } catch (error) {
            console.error('Error loading recently viewed products:', error);
        }
    }, []);

    const handleProductClick = async (productId) => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Please login to view products');

            // Record the product view
            await ApiService.addRecentlyViewed(user.uid, productId);

            // Load the updated list of recently viewed products
            await loadRecentlyViewed();

            // Navigate to the product detail page
            navigate(`/products/${productId}`);
        } catch (error) {
            console.error('Error recording product view:', error);
        }
    };

    useEffect(() => {
        loadAllProducts();
        loadRecentlyViewed();
    }, [loadAllProducts, loadRecentlyViewed]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center mb-8">All Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
                {allProducts.map((product) => (
                    <div
                        key={product.id}
                        className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition transform hover:scale-105"
                        onClick={() => handleProductClick(product.id)}
                    >
                        <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-4">
                            <img
                                src={product.imageUrl || '/api/placeholder/200/200'}
                                alt={product.name || 'Product'}
                                className="w-full h-full object-cover rounded-md"
                            />
                        </div>
                        <h3 className="font-semibold text-lg">{product.name || 'Product Name'}</h3>
                        <p className="text-sm text-gray-500 mt-2">${product.price?.toFixed(2) || '0.00'}</p>
                    </div>
                ))}
            </div>

            <h2 className="text-3xl font-bold text-center mb-8">Recently Viewed Products</h2>
            <RecentlyViewedCarousel
                products={recentProducts}
                onProductClick={(id) => navigate(`/products/${id}`)}
            />
        </div>
    );
};

export default ProductDetail;