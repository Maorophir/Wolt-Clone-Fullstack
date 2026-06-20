const Product = require('../models/productModel');
const User = require('../models/userModel');
const recommendationService = require('../services/recommendationService');

const getProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await Product.find({ restaurantId: id });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: "Server error fetching products" });
    }
};

const getProductById = async (req, res) => {
    try {
        const { pId } = req.params;
        const product = await Product.findById(pId);
       
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // If a logged-in user is viewing this product, record the view in the
        // recommendation server (Ex2). Best-effort and non-blocking: an absent or
        // unknown viewer, or a down recommendation server, never affects this
        // response.
        const authHeader = req.header('Authorization');
        const viewerId = (authHeader && authHeader.startsWith('Bearer ')) ? require('../utils/jwt').verifyToken(authHeader.split(' ')[1]).userId : null;
        if (viewerId) {
            const user = await User.findById(viewerId);
            if (user) {
                recommendationService.registerView(viewerId, product._id.toString());
            }
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: "Server error fetching product" });
    }
};

const createProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, isAvailable, image } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ error: "Product name is required" });
        }

        const newProductData = { 
            name, 
            description, 
            price, 
            isAvailable, 
            image,
            restaurantId: id
        };
        const createdProduct = await Product.create(newProductData);

        res.status(201).location(`/api/restaurants/${id}/products/${createdProduct._id}`).end();
    } catch (error) {
        res.status(500).json({ error: "Server error creating product" });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { pId } = req.params;
        const updateData = req.body;

        if (updateData.name === "") {
            return res.status(400).json({ error: "Product name cannot be empty" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(pId, updateData, { new: true });
       
        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(204).send(); // 204 No Content on success
    } catch (error) {
        res.status(500).json({ error: "Server error updating product" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { pId } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(pId);

        if (!deletedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(204).send(); // 204 No Content on success
    } catch (error) {
        res.status(500).json({ error: "Server error deleting product" });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};