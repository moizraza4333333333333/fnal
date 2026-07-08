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

const leatherHandbagsProduct = {
    _id: 'prod_leather_handbags',
    title: 'LEATHER HANDBAGS',
    images: [
        '/images/LEATHER HANDBAGS/optimized/IMG-20260708-WA0049.webp',
        '/images/LEATHER HANDBAGS/optimized/IMG-20260708-WA0050.webp',
        '/images/LEATHER HANDBAGS/optimized/IMG-20260708-WA0053.webp',
        '/images/LEATHER HANDBAGS/optimized/IMG-20260708-WA0055.webp',
        '/images/LEATHER HANDBAGS/optimized/IMG-20260708-WA0056.webp',
        '/images/LEATHER HANDBAGS/optimized/IMG-20260708-WA0057.webp'
    ]
};

function mapProductRow(row) {
    return {
        _id: row._id,
        title: row.title,
        images: row.images || []
    };
}

async function ensureLeatherHandbagsProductInDb() {
    const result = await pool.query(
        `INSERT INTO products (_id, title, images)
         VALUES ($1, $2, $3)
         ON CONFLICT (_id) DO NOTHING
         RETURNING *`,
        [leatherHandbagsProduct._id, leatherHandbagsProduct.title, JSON.stringify(leatherHandbagsProduct.images)]
    );

    return result.rows[0] ? mapProductRow(result.rows[0]) : null;
}

// @route   GET /api/products
router.get('/', async (req, res) => {
    try {
        await ensureLeatherHandbagsProductInDb();
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        const products = result.rows.map(mapProductRow);
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE _id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const row = result.rows[0];
        res.json({ success: true, data: mapProductRow(row) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/products
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, images } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Product title is required' });
        }
        const _id = 'prod_' + Date.now();
        const result = await pool.query(
            'INSERT INTO products (_id, title, images) VALUES ($1, $2, $3) RETURNING *',
            [_id, title, JSON.stringify(images || [])]
        );
        const row = result.rows[0];
        res.status(201).json({
            success: true,
            message: 'Product created',
            data: mapProductRow(row)
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/products/:id
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, images } = req.body;
        const existing = await pool.query('SELECT * FROM products WHERE _id = $1', [req.params.id]);
        if (existing.rows.length === 0) {
            if (req.params.id !== leatherHandbagsProduct._id) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            const result = await pool.query(
                'INSERT INTO products (_id, title, images) VALUES ($1, $2, $3) RETURNING *',
                [
                    leatherHandbagsProduct._id,
                    title || leatherHandbagsProduct.title,
                    JSON.stringify(images || leatherHandbagsProduct.images)
                ]
            );
            const row = result.rows[0];
            return res.json({
                success: true,
                message: 'Product saved',
                data: mapProductRow(row)
            });
        }

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramIndex++}`);
            values.push(title);
        }
        if (images !== undefined) {
            updates.push(`images = $${paramIndex++}`);
            values.push(JSON.stringify(images));
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(req.params.id);

        const result = await pool.query(
            `UPDATE products SET ${updates.join(', ')} WHERE _id = $${paramIndex} RETURNING *`,
            values
        );
        const row = result.rows[0];
        res.json({
            success: true,
            message: 'Product updated',
            data: mapProductRow(row)
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/products/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM products WHERE _id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            if (req.params.id === leatherHandbagsProduct._id) {
                return res.json({ success: true, message: 'Product deleted', data: { _id: req.params.id } });
            }
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted', data: { _id: result.rows[0]._id } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
