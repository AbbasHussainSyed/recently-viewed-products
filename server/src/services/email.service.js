// src/services/email.service.js
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendMultipleViewsNotification(userEmail, product) {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: userEmail,
                subject: 'Product Viewed Multiple Times',
                html: `
                    <h2>You've viewed this product multiple times</h2>
                    <p>Product ID: ${product.productId}</p>
                    <p>View Count: ${product.viewCount}</p>
                    <p>Last Viewed: ${product.timestamp}</p>
                `
            });
        } catch (error) {
            console.error('Failed to send email notification:', error);
            throw error;
        }
    }
}

module.exports = EmailService;