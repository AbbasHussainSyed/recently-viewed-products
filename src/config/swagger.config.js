const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Recently Viewed Products API',
            version: '1.0.0',
            description: 'API for managing recently viewed products'
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/routes/**/*.js'] // Path to the API routes
};

module.exports = swaggerJsdoc(options);