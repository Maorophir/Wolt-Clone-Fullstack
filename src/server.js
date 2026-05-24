const express = require('express');
const app = express();

// Port configuration - 3000 as default
const PORT = process.env.PORT || 3000;

// Critical Middleware: allows the server to read the request body in JSON format
app.use(express.json());

// --- Here we will later import and connect the Routes from other team members ---
// For example (currently commented out so it doesn't crash):
// const userRoutes = require('./routes/userRoutes');
// app.use('/api/users', userRoutes);

// Temporary route to check that the server is running (Health Check)
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: "WoltProject Node.js Server is up and running!" });
});

// Handle 404 errors (non-existent route)
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint Not Found" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});