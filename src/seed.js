const userModel = require('./models/userModel');
const restaurantModel = require('./models/restaurantModel');
const productModel = require('./models/productModel');

const seedDatabase = () => {
    // 1. Seed User
    const lecturer = userModel.createUser({
        displayName: 'Lecturer',
        username: 'lecturer',
        password: 'password123',
        isBusinessOwner: true,
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200' // Professional avatar
    });

    const normalUser = userModel.createUser({
        displayName: 'Test User',
        username: 'testuser',
        password: 'password123',
        isBusinessOwner: false
    });

    // 2. Seed Restaurants
    const r1 = restaurantModel.createRestaurant({
        name: 'The Burger Joint',
        description: 'Premium handcrafted burgers with secret sauce.',
        address: '123 Main St',
        category: 'Burgers',
        deliveryTime: '20-30 min',
        rating: 4.8,
        priceRange: '$$',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800',
        ownerId: lecturer.id
    });

    const r2 = restaurantModel.createRestaurant({
        name: 'Sushi Master',
        description: 'Authentic Japanese sushi and sashimi.',
        address: '456 Ocean Ave',
        category: 'Sushi',
        deliveryTime: '40-55 min',
        rating: 4.9,
        priceRange: '$$$',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800',
        ownerId: lecturer.id
    });

    const r3 = restaurantModel.createRestaurant({
        name: 'Napoli Pizza',
        description: 'Wood-fired Neapolitan style pizza.',
        address: '789 Pizza Lane',
        category: 'Pizza',
        deliveryTime: '25-40 min',
        rating: 4.6,
        priceRange: '$$',
        image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&q=80&w=800',
        ownerId: lecturer.id
    });

    // 3. Seed Products for Burger Joint
    productModel.createProduct(r1.id, {
        name: 'Classic Cheeseburger',
        description: 'Juicy beef patty, cheddar, lettuce, tomato, house sauce.',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500'
    });
    productModel.createProduct(r1.id, {
        name: 'Truffle Fries',
        description: 'Crispy fries tossed in truffle oil and parmesan.',
        price: 5.99,
        image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&q=80&w=500'
    });
    productModel.createProduct(r1.id, {
        name: 'Milkshake',
        description: 'Thick vanilla milkshake with whipped cream.',
        price: 6.50,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=500'
    });

    // Seed Products for Sushi Master
    productModel.createProduct(r2.id, {
        name: 'Spicy Tuna Roll',
        description: 'Fresh tuna, spicy mayo, cucumber.',
        price: 14.50,
        image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=500'
    });
    productModel.createProduct(r2.id, {
        name: 'Dragon Roll',
        description: 'Eel, cucumber, topped with avocado and sweet sauce.',
        price: 18.00,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&q=80&w=500'
    });
    productModel.createProduct(r2.id, {
        name: 'Miso Soup',
        description: 'Traditional Japanese soup with tofu and wakame.',
        price: 4.50,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=500'
    });

    // Seed Products for Napoli Pizza
    productModel.createProduct(r3.id, {
        name: 'Margherita Pizza',
        description: 'San Marzano tomato sauce, fresh mozzarella, basil.',
        price: 16.00,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=500'
    });
    productModel.createProduct(r3.id, {
        name: 'Pepperoni Pizza',
        description: 'Classic cheese pizza loaded with crispy pepperoni.',
        price: 18.50,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=500'
    });

    console.log('Database successfully seeded with prime showcase data!');
};

module.exports = seedDatabase;
