import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiService } from '../../services/productApi.js';

const ProductPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const productData = await ApiService.getProductById(productId);
                setProduct(productData);
            } catch (error) {
                console.error('Error loading product:', error);
            }
        };

        fetchProduct();
    }, [productId]);

    if (!product) return <p>Loading product details...</p>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-96 object-cover mb-4"
            />
            <p className="text-lg mb-4">${product.price.toFixed(2)}</p>
            <p className="text-gray-700">{product.description}</p>
        </div>
    );
};

export default ProductPage;