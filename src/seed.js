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
        latitude: 32.0709,
        longitude: 34.7805,
        category: 'Burgers',
        deliveryTime: '20-30 min',
        rating: 4.8,
        priceRange: '₪₪',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800',
        ownerId: lecturer.id
    });

    const r2 = restaurantModel.createRestaurant({
        name: 'Sushi Master',
        description: 'Authentic Japanese sushi and sashimi.',
        address: '456 Ocean Ave',
        latitude: 32.0853,
        longitude: 34.7818,
        category: 'Sushi',
        deliveryTime: '40-55 min',
        rating: 4.9,
        priceRange: '₪₪₪',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800',
        ownerId: lecturer.id
    });

    const r3 = restaurantModel.createRestaurant({
        name: 'Napoli Pizza',
        description: 'Wood-fired Neapolitan style pizza.',
        address: '789 Pizza Lane',
        latitude: 32.0614,
        longitude: 34.7716,
        category: 'Pizza',
        deliveryTime: '25-40 min',
        rating: 4.6,
        priceRange: '₪₪',
        image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&q=80&w=800',
        ownerId: lecturer.id
    });

    const r4 = restaurantModel.createRestaurant({
        name: 'Taco Fiesta',
        description: 'Authentic Mexican street tacos and burritos.',
        address: '321 Salsa Blvd',
        latitude: 32.1093,
        longitude: 34.8555,
        category: 'Mexican',
        deliveryTime: '15-25 min',
        rating: 4.7,
        priceRange: '₪',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800',
        ownerId: lecturer.id
    });

    const r5 = restaurantModel.createRestaurant({
        name: 'Vegan Bites',
        description: 'Healthy and delicious plant-based meals.',
        address: '654 Green Way',
        latitude: 32.0660,
        longitude: 34.7740,
        category: 'Healthy',
        deliveryTime: '20-35 min',
        rating: 4.8,
        priceRange: '₪₪',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
        ownerId: lecturer.id
    });

    const r6 = restaurantModel.createRestaurant({
        name: 'The Sweet Spot',
        description: 'Artisanal desserts, cakes, and pastries.',
        address: '987 Sugar Ave',
        latitude: 32.0500,
        longitude: 34.7600,
        category: 'Desserts',
        deliveryTime: '10-20 min',
        rating: 4.9,
        priceRange: '₪₪',
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800',
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

    // --- Additional restaurants spanning more cuisines. The Home category row
    //     is derived from this data (not hard-coded), so each new category here
    //     adds a real, filterable chip. Every entry carries Tel-Aviv coords so
    //     the distance / "nearby" feature has variety to work with, and two
    //     menu items so the menu page is never empty. ---
    const moreRestaurants = [
        {
            name: 'Trattoria Bella', category: 'Italian',
            description: 'Handmade pasta, wood-fired classics, and Italian comfort food.',
            address: '14 Rothschild Blvd', latitude: 32.0750, longitude: 34.7750,
            deliveryTime: '25-40 min', rating: 4.6, priceRange: '₪₪₪',
            image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800',
            products: [
                { name: 'Tagliatelle al Ragù', description: 'Slow-cooked beef ragù over fresh egg tagliatelle.', price: 19.50 },
                { name: 'Mushroom Risotto', description: 'Creamy arborio rice, porcini mushrooms, parmesan.', price: 17.00 },
            ],
        },
        {
            name: 'Wok & Bowl', category: 'Asian',
            description: 'Fragrant noodles, stir-fries, and rice bowls made to order.',
            address: '8 Allenby St', latitude: 32.0680, longitude: 34.7790,
            deliveryTime: '20-30 min', rating: 4.5, priceRange: '₪₪',
            image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800',
            products: [
                { name: 'Pad See Ew Noodles', description: 'Wide rice noodles, egg, broccoli, soy-caramel glaze.', price: 13.90 },
                { name: 'Teriyaki Chicken Bowl', description: 'Grilled chicken, steamed rice, sesame, scallions.', price: 12.50 },
            ],
        },
        {
            name: 'Daily Grind', category: 'Coffee',
            description: 'Specialty espresso, pour-overs, and fresh-baked treats.',
            address: '21 Dizengoff St', latitude: 32.0820, longitude: 34.7700,
            deliveryTime: '10-15 min', rating: 4.7, priceRange: '₪',
            image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800',
            products: [
                { name: 'Flat White', description: 'Double ristretto, velvety steamed milk.', price: 4.50 },
                { name: 'Almond Croissant', description: 'Buttery, flaky, filled with almond cream.', price: 3.90 },
            ],
        },
        {
            name: 'Sunrise Kitchen', category: 'Breakfast',
            description: 'All-day breakfast, fluffy pancakes, and hearty shakshuka.',
            address: '5 Ben Yehuda St', latitude: 32.0590, longitude: 34.7680,
            deliveryTime: '15-25 min', rating: 4.6, priceRange: '₪₪',
            image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800',
            products: [
                { name: 'Buttermilk Pancakes', description: 'Stack of three, maple syrup, fresh berries.', price: 11.00 },
                { name: 'Shakshuka', description: 'Eggs poached in spiced tomato and pepper sauce.', price: 12.50 },
            ],
        },
        {
            name: 'Spice Route', category: 'Indian',
            description: 'Rich curries, tandoori grills, and fresh-baked naan.',
            address: '33 King George St', latitude: 32.0900, longitude: 34.7850,
            deliveryTime: '30-45 min', rating: 4.7, priceRange: '₪₪',
            image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800',
            products: [
                { name: 'Butter Chicken', description: 'Tandoori chicken in a creamy tomato-butter sauce.', price: 16.50 },
                { name: 'Garlic Naan', description: 'Clay-oven flatbread brushed with garlic butter.', price: 3.50 },
            ],
        },
        {
            name: 'Green & Co.', category: 'Vegan',
            description: '100% plant-based bowls, wraps, and cold-pressed juices.',
            address: '12 Sheinkin St', latitude: 32.0640, longitude: 34.7720,
            deliveryTime: '20-30 min', rating: 4.8, priceRange: '₪₪',
            image: 'https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?auto=format&fit=crop&q=80&w=800',
            products: [
                { name: 'Buddha Bowl', description: 'Quinoa, roasted veg, avocado, tahini drizzle.', price: 14.00 },
                { name: 'Green Goddess Juice', description: 'Cucumber, celery, apple, spinach, ginger.', price: 6.50 },
            ],
        },
        {
            name: 'The Catch', category: 'Seafood',
            description: 'Fresh daily catch, grilled fish, and seafood platters.',
            address: '2 Herbert Samuel Promenade', latitude: 32.0780, longitude: 34.7680,
            deliveryTime: '25-40 min', rating: 4.6, priceRange: '₪₪₪',
            image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=80&w=800',
            products: [
                { name: 'Grilled Sea Bass', description: 'Whole sea bass, lemon, herbs, olive oil.', price: 24.00 },
                { name: 'Calamari Fritti', description: 'Crispy fried squid with aioli.', price: 11.50 },
            ],
        },
        {
            name: 'Flour & Co.', category: 'Bakery',
            description: 'Sourdough loaves, pastries, and cakes baked every morning.',
            address: '7 Nahalat Binyamin St', latitude: 32.0550, longitude: 34.7720,
            deliveryTime: '10-20 min', rating: 4.9, priceRange: '₪',
            image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
            products: [
                { name: 'Sourdough Loaf', description: 'Naturally leavened, 24-hour fermented crust.', price: 6.00 },
                { name: 'Cinnamon Roll', description: 'Warm, gooey, topped with cream-cheese glaze.', price: 4.20 },
            ],
        },
        {
            name: 'Ember & Oak', category: 'Grill',
            description: 'Smoked brisket, charcoal-grilled meats, and house rubs.',
            address: '40 Ibn Gabirol St', latitude: 32.1010, longitude: 34.8400,
            deliveryTime: '30-45 min', rating: 4.7, priceRange: '₪₪₪',
            image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=800',
            products: [
                { name: 'Smoked Brisket Plate', description: '12-hour smoked brisket, slaw, pickles.', price: 22.00 },
                { name: 'BBQ Ribs', description: 'Half-rack pork ribs glazed in house BBQ sauce.', price: 19.50 },
            ],
        },
        {
            name: 'Bangkok Bites', category: 'Thai',
            description: 'Authentic Thai street food, curries, and pad thai.',
            address: '18 Florentin St', latitude: 32.0700, longitude: 34.7900,
            deliveryTime: '25-35 min', rating: 4.5, priceRange: '₪₪',
            image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&q=80&w=800',
            products: [
                { name: 'Pad Thai', description: 'Rice noodles, peanuts, tamarind, lime, shrimp.', price: 13.50 },
                { name: 'Green Curry', description: 'Coconut green curry with chicken and basil.', price: 14.50 },
            ],
        },
        {
            name: 'Olive & Vine', category: 'Mediterranean',
            description: 'Mezze, fresh salads, and charcoal-grilled skewers.',
            address: '3 Carmel Market', latitude: 32.0490, longitude: 34.7650,
            deliveryTime: '20-30 min', rating: 4.7, priceRange: '₪₪',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800',
            products: [
                { name: 'Mezze Platter', description: 'Hummus, baba ganoush, falafel, warm pita.', price: 15.00 },
                { name: 'Chicken Souvlaki', description: 'Grilled skewers, tzatziki, lemon, herbs.', price: 13.00 },
            ],
        },
        {
            name: 'Golden Dragon', category: 'Chinese',
            description: 'Dim sum, hand-pulled noodles, and wok classics.',
            address: '25 Levontin St', latitude: 32.0860, longitude: 34.7760,
            deliveryTime: '25-40 min', rating: 4.6, priceRange: '₪₪',
            image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=800',
            products: [
                { name: 'Pork Dumplings', description: 'Steamed dumplings with black vinegar dip.', price: 9.50 },
                { name: 'Kung Pao Chicken', description: 'Wok-fried chicken, peanuts, chili, scallions.', price: 14.00 },
            ],
        },
    ];

    moreRestaurants.forEach((r) => {
        const created = restaurantModel.createRestaurant({
            name: r.name,
            description: r.description,
            address: r.address,
            latitude: r.latitude,
            longitude: r.longitude,
            category: r.category,
            deliveryTime: r.deliveryTime,
            rating: r.rating,
            priceRange: r.priceRange,
            image: r.image,
            ownerId: lecturer.id,
        });
        const thumb = r.image.replace('w=800', 'w=500');
        r.products.forEach((p) => productModel.createProduct(created.id, { ...p, image: thumb }));
    });

    console.log('Database successfully seeded with prime showcase data!');
};

module.exports = seedDatabase;
