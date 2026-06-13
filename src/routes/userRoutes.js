const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');

// GET  /api/users        -> view all registered users (Test endpoint)
router.get('/', userController.getAllUsers);

// POST /api/users        -> register a new user
router.post('/', userController.createUser);

// GET  /api/users/:id    -> view a user's profile
router.get('/:id', userController.getUserById);

const authenticate = require('../middlewares/authMiddleware');

// PATCH /api/users/:id    -> update a user's profile
router.patch('/:id', authenticate, userController.updateUser);

module.exports = router;
