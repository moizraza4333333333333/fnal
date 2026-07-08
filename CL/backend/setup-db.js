require('dotenv').config();
const pool = require('./db');

async function setupDatabase() {
    const client = await pool.connect();
    try {
        console.log('Connected to PostgreSQL. Creating tables...');

        // Users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ users table ready');

        // Pages table - stores page content as JSONB
        await client.query(`
            CREATE TABLE IF NOT EXISTS pages (
                id TEXT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255),
                content JSONB NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ pages table ready');

        // Products table
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                _id TEXT UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                images JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ products table ready');

        // Settings table - single row with JSONB
        await client.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY DEFAULT 1,
                data JSONB NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ settings table ready');

        // Contact messages table
        await client.query(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(100),
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ contact_messages table ready');

        console.log('\nAll tables created successfully!');
    } catch (err) {
        console.error('Error setting up database:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

setupDatabase();
