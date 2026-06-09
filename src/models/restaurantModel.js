const { randomUUID } = require('crypto');
const storage = require('./storage');

const getAllRestaurants = (searchQuery = '') => {
    const allRestaurants = Array.from(storage.restaurants.values());
    if (!searchQuery) {
        return allRestaurants;
    }

    const query = searchQuery.toLowerCase();

    return allRestaurants.filter(restaurant =>
        (restaurant.name && restaurant.name.toLowerCase().includes(query)) ||
        (restaurant.category && restaurant.category.toLowerCase().includes(query))
    );
};

const getRestaurantById = (id) => {
    return storage.restaurants.get(id) || null;
};

const createRestaurant = (restaurantData) => {
    const newRestaurant = {
        id: randomUUID(),
        ...restaurantData
    };

    storage.restaurants.set(newRestaurant.id, newRestaurant);
    return newRestaurant;
};

const updateRestaurant = (id, updateData) => {
    const restaurant = storage.restaurants.get(id);

    if (!restaurant) {
        return null;
    }

    const updatedRestaurant = {
        ...restaurant,
        ...updateData,
        id
    };

    storage.restaurants.set(id, updatedRestaurant);
    return updatedRestaurant;
};

const deleteRestaurant = (id) => {
    const deleted = storage.restaurants.delete(id);

    if (deleted) {
        for (const [productId, product] of storage.products.entries()) {
            if (product.restaurantId === id) {
                storage.products.delete(productId);
            }
        }
    }

    return deleted;
};

module.exports = {
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
};
