const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    // A product ALWAYS belongs to a specific restaurant. 
    // This acts like a Foreign Key.
    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant',
        required: true 
    },
    
    // Product details
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    
    // Is the item currently in stock?
    isAvailable: { type: Boolean, default: true },
    
    // Optional image
    image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
