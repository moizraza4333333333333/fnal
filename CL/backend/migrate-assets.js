/**
 * Migration Script: Upload all existing local assets to Cloudinary
 * and update PostgreSQL database with Cloudinary URLs.
 *
 * This script:
 * 1. Uploads all product images from frontend/public/images/ to Cloudinary
 * 2. Uploads all backend/uploads/ files to Cloudinary
 * 3. Updates the products table with Cloudinary image URLs
 * 4. Updates the pages table to replace localhost URLs with Cloudinary URLs
 */
require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');
const pool = require('./db');
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const FRONTEND_IMAGES_DIR = path.join(__dirname, '..', 'frontend', 'public', 'images');
const BACKEND_UPLOADS_DIR = path.join(__dirname, 'uploads');
const CLOUDINARY_FOLDER = 'leather-gateway';

// Track mapping of old paths -> Cloudinary URLs
const urlMap = {};

/**
 * Upload a single file to Cloudinary
 */
async function uploadToCloudinary(filePath, publicId) {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: CLOUDINARY_FOLDER,
            public_id: publicId,
            resource_type: 'auto'
        });
        console.log(`  ✓ Uploaded: ${path.basename(filePath)} -> ${result.secure_url}`);
        return result.secure_url;
    } catch (err) {
        console.error(`  ✗ Failed to upload ${filePath}: ${err.message}`);
        return null;
    }
}

/**
 * Step 1: Upload all product images from frontend/public/images/
 * These are referenced in products as `/images/...`
 */
async function migrateProductImages() {
    console.log('\n=== STEP 1: Product Images ===');

    const productFolders = [
        'LEATHER BELTS', 'LEATHER APRONS', 'updated aprons/optimized', 'LEATHER GLOVES',
        'LEATHER HANDBAGS/optimized', 'LEATHER JACKETS', 'LEATHER TABLE COASTERS',
        'LEATHER TABLE MATS', 'LEATHER WALLETS', 'Server books', 'leather-belts'
    ];

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.avif'];

    for (const folder of productFolders) {
        const folderPath = path.join(FRONTEND_IMAGES_DIR, folder);
        if (!fs.existsSync(folderPath)) {
            console.log(`  Folder not found: ${folder}`);
            continue;
        }

        const files = fs.readdirSync(folderPath);
        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (!imageExtensions.includes(ext)) continue;

            const fullPath = path.join(folderPath, file);
            const oldPath = `/images/${folder}/${file}`;

            // Create a clean public ID from the file name
            const cleanName = path.parse(file).name
                .replace(/[^a-zA-Z0-9_-]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '')
                .toLowerCase();
            const publicId = `product_${folder.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${cleanName}`;

            const cloudinaryUrl = await uploadToCloudinary(fullPath, publicId);
            if (cloudinaryUrl) {
                urlMap[oldPath] = cloudinaryUrl;
            }
        }
    }
}

/**
 * Step 2: Upload backend/uploads/ files to Cloudinary
 */
async function migrateBackendUploads() {
    console.log('\n=== STEP 2: Backend Uploads ===');

    if (!fs.existsSync(BACKEND_UPLOADS_DIR)) {
        console.log('  Uploads directory not found');
        return;
    }

    const files = fs.readdirSync(BACKEND_UPLOADS_DIR);
    for (const file of files) {
        const fullPath = path.join(BACKEND_UPLOADS_DIR, file);
        if (!fs.statSync(fullPath).isFile()) continue;

        const cleanName = path.parse(file).name
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .toLowerCase();
        const publicId = `upload_${cleanName}`;

        const cloudinaryUrl = await uploadToCloudinary(fullPath, publicId);
        if (cloudinaryUrl) {
            // Map both the /uploads/filename and full localhost URL
            const uploadPath = `/uploads/${file}`;
            const localhostUrl = `http://localhost:5000/uploads/${file}`;
            urlMap[uploadPath] = cloudinaryUrl;
            urlMap[localhostUrl] = cloudinaryUrl;
        }
    }
}

/**
 * Step 3: Update products table with Cloudinary URLs
 */
async function updateProductsTable() {
    console.log('\n=== STEP 3: Update Products Table ===');

    try {
        const result = await pool.query('SELECT * FROM products');
        const products = result.rows;

        for (const product of products) {
            const images = product.images || [];
            let changed = false;

            const newImages = images.map(img => {
                if (urlMap[img]) {
                    changed = true;
                    return urlMap[img];
                }
                // Also check in products.json for the old path mapping
                return img;
            });

            if (changed) {
                await pool.query(
                    'UPDATE products SET images = $1 WHERE _id = $2',
                    [JSON.stringify(newImages), product._id]
                );
                console.log(`  ✓ Updated product "${product.title}" (${product._id})`);
            } else {
                console.log(`  - No changes for product "${product.title}" (${product._id})`);
            }
        }
    } catch (err) {
        console.error('  ✗ Error updating products:', err.message);
    }
}

/**
 * Step 4: Update pages table - replace localhost URLs with Cloudinary URLs
 */
async function updatePagesTable() {
    console.log('\n=== STEP 4: Update Pages Table (replace localhost URLs) ===');

    try {
        const result = await pool.query('SELECT * FROM pages');
        const pages = result.rows;

        for (const page of pages) {
            const content = page.content || {};
            const contentStr = JSON.stringify(content);
            let newContentStr = contentStr;

            // Replace all known mappings
            for (const [oldPath, cloudinaryUrl] of Object.entries(urlMap)) {
                if (newContentStr.includes(oldPath)) {
                    newContentStr = newContentStr.split(oldPath).join(cloudinaryUrl);
                }
            }

            if (newContentStr !== contentStr) {
                const newContent = JSON.parse(newContentStr);
                await pool.query(
                    'UPDATE pages SET content = $1 WHERE id = $2',
                    [JSON.stringify(newContent), page.id]
                );
                console.log(`  ✓ Updated page "${page.title}" (${page.id})`);
            } else {
                console.log(`  - No changes for page "${page.title}" (${page.id})`);
            }
        }
    } catch (err) {
        console.error('  ✗ Error updating pages:', err.message);
    }
}

/**
 * Step 5: Update settings table if it contains localhost URLs
 */
async function updateSettingsTable() {
    console.log('\n=== STEP 5: Update Settings Table ===');

    try {
        const result = await pool.query('SELECT * FROM settings WHERE id = 1');
        if (result.rows.length === 0) {
            console.log('  - No settings found');
            return;
        }

        const settings = result.rows[0];
        const data = settings.data || {};
        const dataStr = JSON.stringify(data);
        let newDataStr = dataStr;

        for (const [oldPath, cloudinaryUrl] of Object.entries(urlMap)) {
            if (newDataStr.includes(oldPath)) {
                newDataStr = newDataStr.split(oldPath).join(cloudinaryUrl);
            }
        }

        if (newDataStr !== dataStr) {
            const newData = JSON.parse(newDataStr);
            await pool.query(
                'UPDATE settings SET data = $1 WHERE id = 1',
                [JSON.stringify(newData)]
            );
            console.log('  ✓ Updated settings');
        } else {
            console.log('  - No changes for settings');
        }
    } catch (err) {
        console.error('  ✗ Error updating settings:', err.message);
    }
}

/**
 * Main migration function
 */
async function migrateAll() {
    console.log('========================================');
    console.log('  ASSET MIGRATION TO CLOUDINARY');
    console.log('========================================');

    try {
        // Step 1: Upload product images
        await migrateProductImages();

        // Step 2: Upload backend uploads
        await migrateBackendUploads();

        console.log('\n=== URL Mapping Summary ===');
        for (const [oldPath, newUrl] of Object.entries(urlMap)) {
            console.log(`  ${oldPath}`);
            console.log(`    -> ${newUrl}`);
        }

        // Step 3-5: Update database
        await updateProductsTable();
        await updatePagesTable();
        await updateSettingsTable();

        console.log('\n========================================');
        console.log('  MIGRATION COMPLETE!');
        console.log(`  Total assets migrated: ${Object.keys(urlMap).length} URLs mapped`);
        console.log('========================================');
    } catch (err) {
        console.error('\nMigration failed:', err);
    } finally {
        await pool.end();
    }
}

migrateAll();
