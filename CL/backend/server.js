require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const contactRoute = require('./routes/contact');
const authRoute = require('./routes/auth');
const pagesRoute = require('./routes/pages');
const settingsRoute = require('./routes/settings');
const uploadRoute = require('./routes/upload');
const productsRoute = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images statically (for backward compatibility with existing data)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/contact', contactRoute);
app.use('/api/auth', authRoute);
app.use('/api/pages', pagesRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/products', productsRoute);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
