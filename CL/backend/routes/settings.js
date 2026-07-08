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

// @route   GET /api/settings
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT data FROM settings WHERE id = 1');
        const settings = result.rows.length > 0 ? result.rows[0].data : {};
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/settings
router.put('/', authMiddleware, async (req, res) => {
    try {
        const existing = await pool.query('SELECT * FROM settings WHERE id = 1');
        if (existing.rows.length === 0) {
            await pool.query('INSERT INTO settings (id, data) VALUES (1, $1)', [JSON.stringify(req.body)]);
        } else {
            const merged = { ...existing.rows[0].data, ...req.body };
            await pool.query('UPDATE settings SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [JSON.stringify(merged)]);
        }
        const result = await pool.query('SELECT data FROM settings WHERE id = 1');
        res.json({ success: true, message: 'Settings updated successfully', data: result.rows[0].data });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
