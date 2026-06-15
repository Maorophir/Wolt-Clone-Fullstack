const restaurantModel = require('../models/restaurantModel');

const getAllRestaurants = (req, res) => {
    const { q } = req.query;
    const restaurants = restaurantModel.getAllRestaurants(q);
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
    const { name, description, address, rating, category, image, latitude, longitude } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }

    // Coordinates are optional; but if either is supplied, both must be valid
    // numbers in range (powers the "nearby" / distance filtering on the client).
    let lat;
    let lng;
    if (latitude !== undefined || longitude !== undefined) {
        lat = Number(latitude);
        lng = Number(longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng) ||
            lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({ error: "Invalid coordinates: latitude must be -90..90 and longitude -180..180" });
        }
    }

    const ownerId = req.userId;
    const newRestaurantData = { name, description, address, rating, category, image, ownerId, latitude: lat, longitude: lng };
    const createdRestaurant = restaurantModel.createRestaurant(newRestaurantData);

    res.status(201).location(`/api/restaurants/${createdRestaurant.id}`).end();
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