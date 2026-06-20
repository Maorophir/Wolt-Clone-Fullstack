const Restaurant = require('../models/restaurantModel');
const Product = require('../models/productModel');

/**
 * Searches for restaurants and products matching the query string.
 * Matches against the 'name' or 'description' fields.
 */
async function searchEverything(req, res) {
    try {
        // 1. Get the query parameter
        const query = req.params.query;
        const results = [];
        
        // Mongoose regex for case-insensitive search
        const searchRegex = { $regex: query, $options: 'i' };
        
        // 2. Search within Restaurants using Mongoose
        const restaurants = await Restaurant.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex }
            ]
        });
        
        for (const restaurant of restaurants) {
            results.push({
                type: 'restaurant',
                ...restaurant.toObject()
            });
        }

        // 3. Search within Products using Mongoose
        const products = await Product.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex }
            ]
        });
        
        for (const product of products) {
            results.push({
                type: 'product',
                ...product.toObject()
            });
        }

        // 4. Return the combined results
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: 'Server error during search' });
    }
}

module.exports = {
    searchEverything
};