const mongoose = require('mongoose');
const addressSchema = require('./addressSchema');

// A sub-schema for individual items inside an order
const orderItemSchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true
    },
    name: { type: String, required: true }, // We save the name so if the product name changes later, the receipt doesn't change
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true } // Price at the time of order
});

const orderSchema = new mongoose.Schema({
    // Every order belongs to a User
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    
    // Every order belongs to a Restaurant
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant',
        required: true
    },
    
    // The list of items ordered
    items: [orderItemSchema],
    
    // The final calculated total price
    totalPrice: { type: Number, required: true },
    
    // The delivery address, reusing our new strict address schema!
    deliveryAddress: { 
        type: addressSchema,
        required: true
    },
    
    // The status of the order
    status: { 
        type: String, 
        enum: ['pending', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
        default: 'pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
