// Vercel Serverless Function — wraps the Express backend
require('dotenv').config({ path: require('path').join(__dirname, '..', 'CL', 'backend', '.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Auto-seed on cold start to ensure new page fields (e.g. heroBannerImage, headerImage)
// are merged into existing database rows. Runs once per cold start; safe to re-run.
let seedPromise = null;
function ensureSeeded() {
    if (!seedPromise) {
        seedPromise = require('../CL/backend/seed').seed().catch((err) => {
            console.error('Auto-seed failed:', err);
            seedPromise = null; // allow retry on next cold start if it failed
        });
    }
    return seedPromise;
}
ensureSeeded();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/auth', require('../CL/backend/routes/auth'));
app.use('/api/contact', require('../CL/backend/routes/contact'));
app.use('/api/pages', require('../CL/backend/routes/pages'));
app.use('/api/products', require('../CL/backend/routes/products'));
app.use('/api/settings', require('../CL/backend/routes/settings'));
app.use('/api/upload', require('../CL/backend/routes/upload'));

// Serve uploaded images statically (for backward compatibility with existing data)
app.use('/uploads', express.static(path.join(__dirname, '..', 'CL', 'backend', 'uploads')));

// Serve the frontend static build
const frontendBuild = path.join(__dirname, '..', 'CL', 'frontend', 'build');
app.use(express.static(frontendBuild));

// SPA fallback — serve index.html for any non-API route
app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(frontendBuild, 'index.html'));
    } else {
        res.status(404).json({ success: false, message: 'API route not found' });
    }
});

// Export for Vercel serverless
module.exports = app;
