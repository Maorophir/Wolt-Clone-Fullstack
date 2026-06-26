const express = require('express');

// Create an Express router instance
const router = express.Router();

// Import the restaurant controller
const restaurantController = require('../controllers/restaurantController');

const { authenticate, authorizeBusiness, authorizeRestaurantOwner } = require('../middlewares/authMiddleware');

// Map each HTTP request to the corresponding controller function
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.post('/', authenticate, authorizeBusiness, restaurantController.createRestaurant);
router.patch('/:id', authenticate, authorizeBusiness, authorizeRestaurantOwner, restaurantController.updateRestaurant);
router.delete('/:id', authenticate, authorizeBusiness, authorizeRestaurantOwner, restaurantController.deleteRestaurant);

// Export the router to be used in the main app.js file
module.exports = router;