const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Default fields to ensure exist on each page (self-healing sync).
// When a page is fetched and is missing any of these keys, they are merged in
// and persisted so the admin controls and public pages can use them.
const PAGE_DEFAULTS = {
    home: { heroBannerImage: '/banner.png' },
    contact: { headerImage: '' },
    services: { heroBannerImage: '/images/service-banner-hero.webp' }
};

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

// @route   GET /api/pages
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title, slug, content, updated_at FROM pages ORDER BY id');
        const pages = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            slug: row.slug,
            ...row.content,
            updatedAt: row.updated_at
        }));
        res.json({ success: true, data: pages });
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/pages/:pageId
router.get('/:pageId', async (req, res) => {
    try {
        const { pageId } = req.params;
        const result = await pool.query('SELECT id, title, slug, content, updated_at FROM pages WHERE id = $1', [pageId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        const row = result.rows[0];
        const existingContent = row.content || {};

        // Self-healing: merge any missing default fields for this page
        const defaults = PAGE_DEFAULTS[pageId];
        let needsUpdate = false;
        const mergedContent = { ...existingContent };
        if (defaults) {
            for (const [key, value] of Object.entries(defaults)) {
                if (!(key in existingContent)) {
                    mergedContent[key] = value;
                    needsUpdate = true;
                }
            }
        }

        if (needsUpdate) {
            await pool.query(
                'UPDATE pages SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [JSON.stringify(mergedContent), pageId]
            );
        }

        const page = {
            id: row.id,
            title: row.title,
            slug: row.slug,
            ...mergedContent,
            updatedAt: row.updated_at
        };
        res.json({ success: true, data: page });
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/pages/:pageId
router.put('/:pageId', authMiddleware, async (req, res) => {
    try {
        const { pageId } = req.params;
        const { title, slug, ...content } = req.body;

        // Check if page exists
        const existing = await pool.query('SELECT * FROM pages WHERE id = $1', [pageId]);

        if (existing.rows.length === 0) {
            // Insert new page
            await pool.query(
                'INSERT INTO pages (id, title, slug, content, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
                [pageId, title || pageId, slug || '', JSON.stringify(content)]
            );
        } else {
            // Update existing page
            await pool.query(
                'UPDATE pages SET title = $1, slug = $2, content = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
                [title || existing.rows[0].title, slug || existing.rows[0].slug, JSON.stringify(content), pageId]
            );
        }

        // Return updated page
        const result = await pool.query('SELECT id, title, slug, content, updated_at FROM pages WHERE id = $1', [pageId]);
        const row = result.rows[0];
        const page = {
            id: row.id,
            title: row.title,
            slug: row.slug,
            ...row.content,
            updatedAt: row.updated_at
        };

        res.json({ success: true, message: 'Page saved successfully', data: page });
    } catch (error) {
        console.error('Error saving page:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
