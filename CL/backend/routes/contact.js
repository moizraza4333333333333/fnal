const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'leathergateway_admin_secret_key_2024');
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
}

// @route   GET /api/contact
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, phone, message, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 100'
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/contact
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email and message'
            });
        }

        // Store in database
        await pool.query(
            'INSERT INTO contact_messages (name, email, phone, message) VALUES ($1, $2, $3, $4)',
            [name, email, phone || null, message]
        );

        console.log('Contact Form Submission:', { name, email, phone, message });

        res.status(200).json({
            success: true,
            message: 'Thank you for your message. We will get back to you soon.'
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

module.exports = router;
