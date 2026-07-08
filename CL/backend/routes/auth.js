const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'leathergateway_admin_secret_key_2024',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/auth/verify
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'leathergateway_admin_secret_key_2024');
        res.json({ success: true, user: decoded });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});

// @route   PUT /api/auth/password
router.put('/password', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'leathergateway_admin_secret_key_2024');
        const { currentPassword, newPassword } = req.body;

        const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, decoded.id]);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
