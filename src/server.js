const express = require('express');
const restaurantRoutes = require('./routes/restaurantRoutes');
const productRoutes = require('./routes/productRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

// Disable ETag and Date header generation for cleaner responses
app.disable('etag');
app.use((req, res, next) => {
    res.removeHeader('Date');
    next();
});

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// --- Authentication & Orders routes  ---
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
    const mongoose = require('mongoose');
    
    // Connect to MongoDB using the environment variable passed from docker-compose
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wolt';
    
    // Globally configure Mongoose to serialize _id as id for React frontend compatibility
    mongoose.set('toJSON', {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
        }
    });

    mongoose.connect(MONGO_URI)
        .then(async () => {
            console.log('✅ Successfully connected to MongoDB.');
            
            // We still call seedDatabase here, but later in Step 5 we will 
            // update seed.js to push data to MongoDB instead of memory arrays.
            const seedDatabase = require('./seed');
            await seedDatabase();

            app.listen(PORT, () => {
                console.log(`🚀 Server is running on http://localhost:${PORT}`);
            });
        })
        .catch(err => {
            console.error('❌ Failed to connect to MongoDB', err);
            process.exit(1);
        });
}

module.exports = app;
