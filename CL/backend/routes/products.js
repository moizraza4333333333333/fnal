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

const defaultProducts = [
    {
        _id: 'prod_2',
        title: 'LEATHER APRONS',
        images: [
            '/images/LEATHER APRONS/pexels-cottonbro-6653234.jpg.jpeg',
            '/images/updated aprons/optimized/IMG-20260708-WA0017.webp',
            '/images/updated aprons/optimized/IMG-20260708-WA0018.webp',
            '/images/updated aprons/optimized/IMG-20260708-WA0019.webp',
            '/images/updated aprons/optimized/IMG-20260708-WA0020.webp',
            '/images/updated aprons/optimized/IMG-20260708-WA0021.webp'
        ]
    },
    {
        _id: 'prod_3',
        title: 'LEATHER GLOVES',
        images: [
            '/images/LEATHER GLOVES/aaron-lefler-emQMyXVpYns-unsplash.jpg.jpeg',
            '/images/LEATHER GLOVES/pexels-johanna-2151290000-36552347.jpg.jpeg',
            '/images/updated gloves/optimized/06_-_2026-04-21t195130.926.webp',
            '/images/updated gloves/optimized/18-2.webp',
            '/images/updated gloves/optimized/age-of-glory-shifter-gloves-brown-leather-and-denim-315489.webp',
            '/images/updated gloves/optimized/Black_Axel_Leather_Motorcycle_Gloves_lifestyle.webp'
        ]
    },
    {
        _id: 'prod_leather_jackets',
        title: 'LEATHER JACKETS',
        images: [
            '/images/ipdated jackets/IMG-20260709-WA0028.jpg.jpeg',
            '/images/ipdated jackets/IMG-20260709-WA0029.jpg.jpeg',
            '/images/ipdated jackets/IMG-20260709-WA0031.jpg.jpeg',
            '/images/ipdated jackets/IMG-20260709-WA0033.jpg.jpeg',
            '/images/ipdated jackets/IMG-20260709-WA0034.jpg.jpeg'
        ]
    },
    {
        _id: 'prod_7',
        title: 'LEATHER WALLETS',
        images: [
            '/images/LEATHER WALLETS/geoffrey-crofte-t5Ui6FXTrO4-unsplash.jpg.jpeg',
            '/images/LEATHER WALLETS/julius-drost-GTmLKWZzZuo-unsplash.jpg.jpeg',
            '/images/update wallet/optimized/FBXHWFOIMJE64JE.webp',
            '/images/update wallet/optimized/FrontViewofletherwalletbygodbolegearblack.webp',
            '/images/update wallet/optimized/high-quality-leather-wallets-in-various-colors-on-glass-shelf-picture-photo.webp',
            '/images/update wallet/optimized/images--4.webp',
            '/images/update wallet/optimized/Larsen-Long-Wallet-Burgundy-Brown--1.webp',
            '/images/update wallet/optimized/mens-luxury-leather-wallet-durable-crazy-horse-ideal-gift-380.webp',
            '/images/update wallet/optimized/new-brown-leather-wallet-dark-background_93675-95463.webp'
        ]
    },
    {
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
    },
    {
        _id: 'prod_leather_holsters',
        title: 'LEATHER HOLSTERS',
        images: [
            '/images/Leather Holsters/optimized/098265463e2f50e855cb7f129ddb755c.webp',
            '/images/Leather Holsters/optimized/14ad6f081c28586bfcd9715603fe04d5.webp',
            '/images/Leather Holsters/optimized/1ae37d0f80cd0af673d4d69ea0c6d83d.webp',
            '/images/Leather Holsters/optimized/4e7c4296fcb7da7a50dc25846b876c05.webp',
            '/images/Leather Holsters/optimized/54b5587e92f4c21718f7a01a346fc7b1.webp',
            '/images/Leather Holsters/optimized/89fdac4145fdac6cec578853bc04aff3.webp',
            '/images/Leather Holsters/optimized/9cf63244919030c10b50a61ee853316b.webp',
            '/images/Leather Holsters/optimized/bcad5b4ee3f934bd5dae8fd2002851b0.webp',
            '/images/Leather Holsters/optimized/c707da34294b511a853b0dadb30ac0d9.webp'
        ]
    },
    {
        _id: 'prod_leather_waters_wallets',
        title: 'LEATHER WATER\'S WALLETS',
        images: [
            '/images/LEATHER WATER\'S  WALLETS/optimized/10078_0.webp',
            '/images/LEATHER WATER\'S  WALLETS/optimized/28fe6bc39d6e1916c4498573ce0f406d.webp',
            '/images/LEATHER WATER\'S  WALLETS/optimized/8cdc5f0cf88a76fd15fa963c5d873b39.webp',
            '/images/LEATHER WATER\'S  WALLETS/optimized/da563c15a19c939ab96c702e261a038c.webp',
            '/images/LEATHER WATER\'S  WALLETS/optimized/debed52bb6c73e3f7dcd1ee85275898a.webp',
            '/images/LEATHER WATER\'S  WALLETS/optimized/Esquire-Kellnerboerse-Dallas-Waiter-Wallet-Braun-313942_4.webp',
            '/images/LEATHER WATER\'S  WALLETS/optimized/Hamosons-1019-Kellnerboerse-leder-Kellnerportemonnaie-Waterproof-Farben.webp'
        ]
    }
];

function mapProductRow(row) {
    return {
        _id: row._id,
        title: row.title,
        images: row.images || []
    };
}

async function ensureDefaultProductInDb(defaultProduct) {
    const existing = await pool.query('SELECT * FROM products WHERE _id = $1', [defaultProduct._id]);
    if (existing.rows.length === 0) {
        const result = await pool.query(
            'INSERT INTO products (_id, title, images) VALUES ($1, $2, $3) RETURNING *',
            [defaultProduct._id, defaultProduct.title, JSON.stringify(defaultProduct.images)]
        );
        return mapProductRow(result.rows[0]);
    }

    return mapProductRow(existing.rows[0]);
}

async function ensureDefaultProductsInDb() {
    await Promise.all(defaultProducts.map(ensureDefaultProductInDb));
}

// @route   GET /api/products
router.get('/', async (req, res) => {
    try {
        await ensureDefaultProductsInDb();
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
            const defaultProduct = defaultProducts.find(product => product._id === req.params.id);
            if (!defaultProduct) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            const result = await pool.query(
                'INSERT INTO products (_id, title, images) VALUES ($1, $2, $3) RETURNING *',
                [
                    defaultProduct._id,
                    title || defaultProduct.title,
                    JSON.stringify(images || defaultProduct.images)
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
            const defaultProduct = defaultProducts.find(product => product._id === req.params.id);
            if (defaultProduct) {
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
