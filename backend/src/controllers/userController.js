const { createToken } = require('../utils/jwt');
const User = require('../models/userModel');
const Restaurant = require('../models/restaurantModel');

/**
 * Strips the password before sending the user object back to the client.
 */
const toPublic = (userDoc) => {
    // Mongoose documents need to be converted to plain Javascript objects first
    const user = userDoc.toObject ? userDoc.toObject() : userDoc;
    const { password, ...publicUser } = user;
    return publicUser;
};

/**
 * GET /api/users
 */
// Every function must now be 'async' because database queries take time!
const getAllUsers = async (req, res) => {
    try {
        // Mongoose query: Find all users in the collection
        const allUsers = await User.find();
        const publicUsers = allUsers.map(toPublic);
        res.status(200).json(publicUsers);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * POST /api/users
 */
const createUser = async (req, res) => {
    try {
        const { displayName, username, password, profileImage, isBusinessOwner, addresses } = req.body;

        if (!displayName) return res.status(400).json({ message: 'Display name is required' });
        if (!username) return res.status(400).json({ message: 'Username is required' });
        if (!password) return res.status(400).json({ message: 'Password is required' });
        
        if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and contain both letters and numbers' });
        }

        // Mongoose query: Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already taken' });
        }

        if (addresses !== undefined) {
            if (!Array.isArray(addresses)) {
                return res.status(400).json({ message: 'addresses must be an array' });
            }
            try {
                // Map over the array and validate each address using our shared utility
                // We reassign 'addresses' to the properly formatted data returned by parseAddressData
                const { parseAddressData } = require('../utils/addressUtils');
                for (let i = 0; i < addresses.length; i++) {
                    addresses[i] = parseAddressData(addresses[i]);
                }
            } catch (err) {
                return res.status(400).json({ message: err.message });
            }
        }

        // Mongoose query: Create and save the new user directly to MongoDB
        const createdUser = await User.create({
            displayName, username, password, profileImage, isBusinessOwner, addresses
        });

        // Use the generated _id
        const token = createToken({ userId: createdUser._id });

        res.status(201)
            .location(`/api/users/${createdUser._id}`)
            .json({ user: toPublic(createdUser), token });
            
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

/**
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
    try {
        // Mongoose query: Find by ID
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(toPublic(user));
    } catch (error) {
        res.status(500).json({ error: 'Invalid ID or Server Error' });
    }
};

/**
 * PATCH /api/users/:id
 */
const updateUser = async (req, res) => {
    try {
        if (req.userId !== req.params.id && !req.isAdmin) {
            return res.status(403).json({ error: 'You can only update your own profile or must be an admin' });
        }

        const { displayName, profileImage, addresses, favorites } = req.body;
        const updates = {};
        if (displayName !== undefined) updates.displayName = displayName;
        if (profileImage !== undefined) updates.profileImage = profileImage;
        if (favorites !== undefined) updates.favorites = favorites;
        if (addresses !== undefined) {
            if (!Array.isArray(addresses)) {
                return res.status(400).json({ message: 'addresses must be an array' });
            }
            try {
                const { parseAddressData } = require('../utils/addressUtils');
                for (let i = 0; i < addresses.length; i++) {
                    addresses[i] = parseAddressData(addresses[i]);
                }
                updates.addresses = addresses;
            } catch (err) {
                return res.status(400).json({ message: err.message });
            }
        }

        // Mongoose query: find by ID and update. 
        // { new: true } tells Mongoose to return the UPDATED document, not the old one.
        const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(toPublic(updatedUser));
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

/**
 * GET /api/users/:id/restaurants
 */
const getUserRestaurants = async (req, res) => {
    try {
        // Mongoose query: Find all restaurants where ownerId matches the user's ID
        const userRestaurants = await Restaurant.find({ ownerId: req.params.id });
        res.status(200).json(userRestaurants);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    getUserRestaurants
};
