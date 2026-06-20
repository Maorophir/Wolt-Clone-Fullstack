const mongoose = require('mongoose');
const addressSchema = require('./addressSchema');

const restaurantSchema = new mongoose.Schema({
    // Basic restaurant info
    name: { type: String, required: true },
    category: { type: String },
    description: { type: String },
    
    // We reuse our new addressSchema here!
    // Notice it's not an array [], just a single object because a restaurant has exactly one address.
    address: addressSchema,
    
    // Meta information for the UI
    deliveryTime: { type: String },
    rating: { type: Number, default: 0 },
    priceRange: { type: String },
    image: { type: String },
    
    // This links the restaurant to the User who created it (Business Owner).
    // It's like a Foreign Key in SQLite!
    ownerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
