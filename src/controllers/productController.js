const productModel = require('../models/productModel');

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
    
    // TODO for Maor/Eden: Add C++ TCP server call here to register product view
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