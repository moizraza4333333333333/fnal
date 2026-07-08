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

async function ensureContactMessageColumns() {
    await pool.query('ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE');
}

// @route   GET /api/contact
router.get('/', authMiddleware, async (req, res) => {
    try {
        await ensureContactMessageColumns();
        const { status } = req.query;
        const whereClause = status === 'read' ? 'WHERE is_read = TRUE' : status === 'unread' ? 'WHERE is_read = FALSE' : '';
        const result = await pool.query(
            `SELECT id, name, email, phone, message, is_read, created_at FROM contact_messages ${whereClause} ORDER BY created_at DESC LIMIT 100`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PATCH /api/contact/:id/read
router.patch('/:id/read', authMiddleware, async (req, res) => {
    try {
        await ensureContactMessageColumns();
        const result = await pool.query(
            'UPDATE contact_messages SET is_read = TRUE WHERE id = $1 RETURNING id, name, email, phone, message, is_read, created_at',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        res.json({ success: true, message: 'Message marked as read', data: result.rows[0] });
    } catch (error) {
        console.error('Error marking contact message as read:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/contact/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        res.json({ success: true, message: 'Message removed', data: { id: result.rows[0].id } });
    } catch (error) {
        console.error('Error deleting contact message:', error);
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
