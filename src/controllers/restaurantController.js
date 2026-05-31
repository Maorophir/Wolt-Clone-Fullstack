const restaurantModel = require('../models/restaurantModel');

const getAllRestaurants = (req, res) => {
    const restaurants = restaurantModel.getAllRestaurants();
    res.status(200).json(restaurants);
};

const getRestaurantById = (req, res) => {
    const restaurant = restaurantModel.getRestaurantById(req.params.id);
    if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.status(200).json(restaurant);
};

const createRestaurant = (req, res) => {
    const { name, description, address, rating } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }

    const newRestaurantData = { name, description, address, rating };
    const createdRestaurant = restaurantModel.createRestaurant(newRestaurantData);

    res.status(201).json(createdRestaurant);
};

const updateRestaurant = (req, res) => {
    const { id } = req.params;
    
    const updateData = req.body; 

   
    if (updateData.name === "") {
        return res.status(400).json({ error: "Name cannot be empty" });
    }

    
    const updatedRestaurant = restaurantModel.updateRestaurant(id, updateData);
    
   
    if (!updatedRestaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.status(204).send();
};

const deleteRestaurant = (req, res) => {
    
    const { id } = req.params;
    
    const isDeleted = restaurantModel.deleteRestaurant(id);


    if (!isDeleted) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

   
    res.status(204).send();
};

module.exports = {
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
};