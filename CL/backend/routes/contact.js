const express = require('express');
const router = express.Router();
const pool = require('../db');

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
