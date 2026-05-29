const storage = require('../models/storage');

/**
 * Searches for restaurants and products matching the query string.
 * Matches against the 'name' or 'description' fields.
 */
function searchEverything(req, res) {
    // 1. Get the query parameter and convert to lowercase for case-insensitive search
    const query = req.params.query.toLowerCase();
    const results = [];

    // 2. Search within Restaurants
    // storage.restaurants.values() gives us an iterator over all restaurant objects
    for (const restaurant of storage.restaurants.values()) {
        const nameMatch = restaurant.name && restaurant.name.toLowerCase().includes(query);
        const descMatch = restaurant.description && restaurant.description.toLowerCase().includes(query);

        if (nameMatch || descMatch) {
            results.push({
                type: 'restaurant',
                ...restaurant
            });
        }
    }

    // 3. Search within Products
    for (const product of storage.products.values()) {
        const nameMatch = product.name && product.name.toLowerCase().includes(query);
        const descMatch = product.description && product.description.toLowerCase().includes(query);

        if (nameMatch || descMatch) {
            results.push({
                type: 'product',
                ...product
            });
        }
    }

    // 4. Return the combined results
    res.status(200).json(results);
}

module.exports = {
    searchEverything
};