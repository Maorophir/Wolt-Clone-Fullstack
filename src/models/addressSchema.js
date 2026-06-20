const mongoose = require('mongoose');

// We extract this sub-schema so it can be cleanly reused by Users, Restaurants, and Orders.
const addressSchema = new mongoose.Schema({
    name: { type: String }, // Allows the user to store a text address (e.g. "Dizengoff 50")
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
});

module.exports = addressSchema;
