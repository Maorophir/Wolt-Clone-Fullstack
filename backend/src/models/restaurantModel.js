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

// Flatten the address sub-document into top-level fields so the API
// response matches the shape the React frontend expects:
//   { address: "123 Main St", latitude: 32.07, longitude: 34.78, ... }
restaurantSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        if (ret.address && typeof ret.address === 'object') {
            ret.latitude = ret.address.latitude;
            ret.longitude = ret.address.longitude;
            ret.address = ret.address.name || '';
        }
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
