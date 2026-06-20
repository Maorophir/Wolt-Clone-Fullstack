const Restaurant = require('../models/restaurantModel');
const { parseAddressData } = require('../utils/addressUtils');

const getAllRestaurants = async (req, res) => {
    try {
        const { q } = req.query;
        let query = {};
        if (q) {
            query.name = { $regex: q, $options: 'i' };
        }
        const restaurants = await Restaurant.find(query);
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching restaurants' });
    }
};

const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.status(200).json(restaurant);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching restaurant' });
    }
};

const createRestaurant = async (req, res) => {
    try {
        const { name, description, address, rating, category, image, latitude, longitude } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        let restaurantAddress;
        try {
            restaurantAddress = parseAddressData(address, latitude, longitude);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }

        const ownerId = req.userId;
        
        const newRestaurantData = { 
            name, 
            description, 
            address: restaurantAddress, 
            rating, 
            category, 
            image, 
            ownerId 
        };

        const createdRestaurant = await Restaurant.create(newRestaurantData);

        res.status(201).location(`/api/restaurants/${createdRestaurant._id}`).end();
    } catch (error) {
        res.status(500).json({ error: 'Server error creating restaurant', details: error.message });
    }
};

const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.name === "") {
            return res.status(400).json({ error: "Name cannot be empty" });
        }

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, updateData, { new: true });
       
        if (!updatedRestaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Server error updating restaurant' });
    }
};

const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
       
        const deletedRestaurant = await Restaurant.findByIdAndDelete(id);

        if (!deletedRestaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Server error deleting restaurant' });
    }
};

module.exports = {
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
};