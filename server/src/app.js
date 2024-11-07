// src/app.js
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');
const express = require('express');
const path = require('path'); // Import the path module
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { initializeFirebase } = require('./config/firebase.config');
const { initializeRedis } = require('./config/redis.config');
const CacheService = require('./services/cache.service');
const ProductService = require('./services/product.service');
const ProductController = require('./controllers/product.controller');
const productRoutes = require('./routes/v1/product.routes');

// Initialize Firebase and Redis
const admin = initializeFirebase();
const redisClient = initializeRedis();

// Initialize services and controllers
const cacheService = new CacheService(redisClient);
const productService = new ProductService(cacheService);
const productController = new ProductController(productService);

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Recently Viewed Products API Documentation"
}));

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// API Routes
app.use('/api/v1', productRoutes(productController));

// Serve static files from the "public" directory (where your frontend build is located)
app.use(express.static(path.join(__dirname, '..', 'public', 'dist'))); // Adjust the path as needed

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public','dist', 'index.html')); // Adjust the path as needed
});

// Error handling middleware
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;