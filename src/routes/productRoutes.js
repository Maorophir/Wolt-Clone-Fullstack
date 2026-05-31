const express = require('express');

// We use mergeParams to access the :id parameter from the parent restaurant route
const router = express.Router({ mergeParams: true });

const productController = require('../controllers/productController');

// Map endpoints for /api/restaurants/:id/products
router.get('/', productController.getProducts);
router.post('/', productController.createProduct);

// Map endpoints for /api/restaurants/:id/products/:pId
router.get('/:pId', productController.getProductById);
router.patch('/:pId', productController.updateProduct);
router.delete('/:pId', productController.deleteProduct);

module.exports = router;