const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const recommendationService = require('../services/recommendationService');

const getProducts = (req, res) => {
    const { id } = req.params;
    const products = productModel.getProductsByRestaurantId(id);
    res.status(200).json(products);
};

const getProductById = (req, res) => {
    const { pId } = req.params;
    const product = productModel.getProductById(pId);
    
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    // If a logged-in user is viewing this product, record the view in the
    // recommendation server (Ex2). Best-effort and non-blocking: an absent or
    // unknown viewer, or a down recommendation server, never affects this
    // response.
    const viewerId = req.header('X-User-Id');
    if (viewerId && userModel.getUserById(viewerId)) {
        recommendationService.registerView(viewerId, product.id);
    }

    res.status(200).json(product);
};

const createProduct = (req, res) => {
    const { id } = req.params; 
    const { name, description, price, isAvailable } = req.body;

    // Validate required fields
    if (!name) {
        return res.status(400).json({ error: "Product name is required" });
    }

    const newProductData = { name, description, price, isAvailable };
    const createdProduct = productModel.createProduct(id, newProductData);

    res.status(201).json(createdProduct);
};

const updateProduct = (req, res) => {
    const { pId } = req.params; 
    const updateData = req.body;

    if (updateData.name === "") {
        return res.status(400).json({ error: "Product name cannot be empty" });
    }

    const updatedProduct = productModel.updateProduct(pId, updateData);
    
    if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
    }

    res.status(204).send(); // 204 No Content on success
};

const deleteProduct = (req, res) => {
    const { pId } = req.params;
    const isDeleted = productModel.deleteProduct(pId);

    if (!isDeleted) {
        return res.status(404).json({ error: "Product not found" });
    }

    res.status(204).send(); // 204 No Content on success
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};