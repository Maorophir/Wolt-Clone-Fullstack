const express = require('express');
const restaurantRoutes = require('./routes/restaurantRoutes');
const productRoutes = require('./routes/productRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- Authentication & Orders routes (PRS-91, PRS-118) ---
const userRoutes = require('./routes/userRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/users', userRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/orders', orderRoutes);

// Temporary route to check that the server is running (Health Check)
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'WoltProject Node.js Server is up and running!' });
});


app.use('/api/restaurants', restaurantRoutes);
app.use('/api/restaurants/:id/products', productRoutes);
app.use('/api/search', searchRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint Not Found' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
