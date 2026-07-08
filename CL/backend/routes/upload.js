const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const jwt = require('jsonwebtoken');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'leather-gateway',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'avif', 'pdf', 'mp4'],
        resource_type: 'auto',
        public_id: (req, file) => 'file_' + Date.now() + '_' + Math.round(Math.random() * 1e9)
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB for videos/pdfs
});

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

function cloudinaryConfigMiddleware(req, res, next) {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(500).json({ success: false, message: 'Cloudinary is not configured on the server' });
    }
    next();
}

function uploadErrorHandler(error, req, res, next) {
    if (!error) return next();
    console.error('Upload middleware error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Upload failed' });
}

// @route   POST /api/upload
router.post('/', authMiddleware, cloudinaryConfigMiddleware, upload.single('image'), uploadErrorHandler, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        // Cloudinary returns the URL in req.file.path
        res.json({
            success: true,
            url: req.file.path,
            filename: req.file.filename,
            public_id: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
