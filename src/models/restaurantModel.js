const { v4: uuidv4 } = require('uuid');

let restaurants = []; // In-memory data store

const getAllRestaurants = () => {
    return restaurants;
};

const getRestaurantById = (id) => {
    return restaurants.find(restaurant => restaurant.id === id);
};

const createRestaurant = (restaurantData) => {
    const newRestaurant = { id: uuidv4(), ...restaurantData };
    restaurants.push(newRestaurant);
    return newRestaurant;
};

const updateRestaurant = (id, updateData) => {
    const index = restaurants.findIndex(r => r.id === id);
    if (index === -1) return null; // Restaurant not found
    
    restaurants[index] = { ...restaurants[index], ...updateData };
    return restaurants[index];
};

const deleteRestaurant = (id) => {
    const initialLength = restaurants.length;
    restaurants = restaurants.filter(r => r.id !== id);
    return restaurants.length < initialLength; // True if deleted
};

module.exports = {
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
};