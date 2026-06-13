const { randomUUID } = require('crypto');
const storage = require('./storage');

const getProductsByRestaurantId = (restaurantId) => {
    return Array.from(storage.products.values()).filter(product => product.restaurantId === restaurantId);
};

const getProductById = (productId) => {
    return storage.products.get(productId) || null;
};

const createProduct = (restaurantId, productData) => {
    const newProduct = {
        id: randomUUID(),
        restaurantId,
        isAvailable: true,
        ...productData
    };
    if (newProduct.isAvailable === undefined) {
        newProduct.isAvailable = true;
    }

    storage.products.set(newProduct.id, newProduct);
    return newProduct;
};

const updateProduct = (productId, updateData) => {
    const product = storage.products.get(productId);
    if (!product) {
        return null;
    }

    const updatedProduct = {
        ...product,
        ...updateData,
        id: productId
    };

    storage.products.set(productId, updatedProduct);
    return updatedProduct;
};

const deleteProduct = (productId) => {
    return storage.products.delete(productId);
};

module.exports = {
    getProductsByRestaurantId,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
