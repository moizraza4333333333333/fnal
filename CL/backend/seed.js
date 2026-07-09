require('dotenv').config();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function seed() {
    const client = await pool.connect();
    try {
        console.log('Connected to PostgreSQL. Seeding data...\n');

        // --- Seed Users ---
        console.log('Seeding users...');
        const existingUser = await client.query('SELECT * FROM users WHERE email = $1', ['admin@leathergateway.com']);
        if (existingUser.rows.length === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            await client.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                ['Admin', 'admin@leathergateway.com', hashedPassword, 'admin']
            );
            console.log('✓ Admin user created (admin@leathergateway.com / admin123)');
        } else {
            console.log('→ Admin user already exists');
        }

        // --- Seed Pages ---
        console.log('\nSeeding pages...');
        const pagesPath = path.join(__dirname, 'data', 'pages.json');
        if (fs.existsSync(pagesPath)) {
            const pagesData = JSON.parse(fs.readFileSync(pagesPath, 'utf-8'));
            for (const page of pagesData) {
                const { id, title, slug, updatedAt, ...content } = page;
                const existingPage = await client.query('SELECT * FROM pages WHERE id = $1', [id]);
                if (existingPage.rows.length === 0) {
                    await client.query(
                        'INSERT INTO pages (id, title, slug, content, updated_at) VALUES ($1, $2, $3, $4, $5)',
                        [id, title || id, slug || '', JSON.stringify(content), updatedAt ? new Date(updatedAt) : new Date()]
                    );
                    console.log(`✓ Page "${id}" created`);
                } else {
                    // Merge new fields into existing content without overwriting admin changes
                    const existingContent = existingPage.rows[0].content || {};
                    const mergedContent = { ...content, ...existingContent };
                    let updated = false;
                    for (const key of Object.keys(content)) {
                        if (!(key in existingContent)) {
                            updated = true;
                        }
                    }
                    if (updated) {
                        await client.query(
                            'UPDATE pages SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                            [JSON.stringify(mergedContent), id]
                        );
                        console.log(`✓ Page "${id}" updated with new fields`);
                    } else {
                        console.log(`→ Page "${id}" already exists and up to date`);
                    }
                }
            }
        } else {
            console.log('⚠ pages.json not found, skipping');
        }

        // --- Seed Settings ---
        console.log('\nSeeding settings...');
        const settingsPath = path.join(__dirname, 'data', 'settings.json');
        if (fs.existsSync(settingsPath)) {
            const settingsData = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
            const existingSettings = await client.query('SELECT * FROM settings WHERE id = 1');
            if (existingSettings.rows.length === 0) {
                await client.query(
                    'INSERT INTO settings (id, data) VALUES (1, $1)',
                    [JSON.stringify(settingsData)]
                );
                console.log('✓ Settings created');
            } else {
                console.log('→ Settings already exist');
            }
        } else {
            console.log('⚠ settings.json not found, skipping');
        }

        // --- Seed Products ---
        console.log('\nSeeding products...');
        const productsPath = path.join(__dirname, 'data', 'products.json');
        if (fs.existsSync(productsPath)) {
            const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
            for (const product of productsData) {
                const existingProduct = await client.query('SELECT * FROM products WHERE _id = $1', [product._id]);
                if (existingProduct.rows.length === 0) {
                    await client.query(
                        'INSERT INTO products (_id, title, images) VALUES ($1, $2, $3)',
                        [product._id, product.title, JSON.stringify(product.images || [])]
                    );
                    console.log(`✓ Product "${product.title}" created`);
                } else {
                    console.log(`→ Product "${product.title}" already exists`);
                }
            }
        } else {
            console.log('⚠ products.json not found, skipping');
        }

        console.log('\n✓ Seed completed successfully!');
    } catch (err) {
        console.error('Seed error:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

// Export for programmatic use (e.g., from serverless cold start)
module.exports = { seed };

// Auto-run only when executed directly (node seed.js), not when required
if (require.main === module) {
    seed();
}
