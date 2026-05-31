const { v4: uuidv4 } = require('uuid');

let products = []; // In-memory data store for products

// Retrieves all products belonging to a specific restaurant
const getProductsByRestaurantId = (restaurantId) => {
    return products.filter(product => product.restaurantId === restaurantId);
};

// Retrieves a specific product by its unique ID
const getProductById = (productId) => {
    return products.find(product => product.id === productId);
};

// Creates a new product linked to a restaurant and adds it to the array
const createProduct = (restaurantId, productData) => {
    const newProduct = {
        id: uuidv4(),
        restaurantId,
        ...productData
    };
    products.push(newProduct);
    return newProduct;
};

// Updates an existing product's fields
const updateProduct = (productId, updateData) => {
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) return null; // Product not found
    
    products[index] = { ...products[index], ...updateData };
    return products[index];
};

// Deletes a product from the array
const deleteProduct = (productId) => {
    const initialLength = products.length;
    products = products.filter(p => p.id !== productId);
    return products.length < initialLength; // True if deleted
};

module.exports = {
    getProductsByRestaurantId,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};