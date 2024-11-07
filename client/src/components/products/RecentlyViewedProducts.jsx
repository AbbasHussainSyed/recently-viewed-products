// src/components/products/RecentlyViewedCarousel.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const RecentlyViewedCarousel = ({ products, currentProductId, onProductClick }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 4;
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handleNext = () => {
        setCurrentIndex(prev =>
            prev + itemsPerPage >= products.length ? 0 : prev + itemsPerPage
        );
    };

    const handlePrevious = () => {
        setCurrentIndex(prev =>
            prev - itemsPerPage < 0
                ? Math.max(0, products.length - itemsPerPage)
                : prev - itemsPerPage
        );
    };

    // Carousel card component
    const ProductCard = ({ product }) => (
        <div className="w-1/4 flex-shrink-0 px-2">
            <div className="border rounded-lg p-4 h-full">
                <div className="aspect-square bg-gray-100 rounded-md mb-2">
                    <img
                        src={product.productDetails?.imageUrl || '/api/placeholder/200/200'}
                        alt={product.productDetails?.name || 'Product'}
                        className="w-full h-full object-cover rounded-md"
                    />
                </div>
                <div className="space-y-2">
                    {product.productDetails?.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {product.productDetails.category}
                        </span>
                    )}
                    <h3 className="font-medium truncate">
                        {product.productDetails?.name || 'Product Name'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        ${product.productDetails?.price?.toFixed(2) || '0.00'}
                    </p>
                    <button
                        onClick={() => onProductClick(product.productId)}
                        className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        disabled={product.productId === currentProductId}
                    >
                        {product.productId === currentProductId ? 'Current Product' : 'View Details'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold mb-6">Recently Viewed Products</h2>
            <div className="relative">
                <div className="flex items-center">
                    {products.length > itemsPerPage && (
                        <button
                            onClick={handlePrevious}
                            className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 absolute left-0 z-10 transform -translate-x-1/2"
                            aria-label="Previous items"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    )}

                    <div className="flex overflow-hidden mx-8">
                        <div
                            className="flex transition-transform duration-300 ease-in-out"
                            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
                        >
                            {products.map((product) => (
                                <ProductCard
                                    key={product.productId}
                                    product={product}
                                />
                            ))}
                        </div>
                    </div>

                    {products.length > itemsPerPage && (
                        <button
                            onClick={handleNext}
                            className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 absolute right-0 z-10 transform translate-x-1/2"
                            aria-label="Next items"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center mt-4 gap-2">
                        {Array.from({ length: totalPages }).map((_, idx) => (
                            <button
                                key={idx}
                                className={`w-2 h-2 rounded-full ${
                                    Math.floor(currentIndex / itemsPerPage) === idx
                                        ? 'bg-blue-600'
                                        : 'bg-gray-300'
                                }`}
                                onClick={() => setCurrentIndex(idx * itemsPerPage)}
                                aria-label={`Go to page ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentlyViewedCarousel;