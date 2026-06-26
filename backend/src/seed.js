const User = require('./models/userModel');
const Restaurant = require('./models/restaurantModel');
const Product = require('./models/productModel');

const seedDatabase = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log('Database already seeded. Skipping seed process.');
            return;
        }

        console.log('Seeding database with fresh Mongoose models...');

        // 1. Seed Users
        const adminUser = await User.create({
            displayName: 'Admin',
            username: 'admin',
            password: 'password123',
            isBusinessOwner: true,
            isAdmin: true,
            profileImage: '/admin_avatar.png'
        });

        const normalUser = await User.create({
            displayName: 'Test User',
            username: 'testuser',
            password: 'password123',
            isBusinessOwner: false
        });

        // 2. Seed Restaurants & Products
        const restaurantsData = [
            {
                name: 'The Burger Joint', category: 'Burgers',
                description: 'Premium handcrafted burgers with secret sauce.',
                address: { name: '123 Main St', latitude: 32.0709, longitude: 34.7805 },
                deliveryTime: '20-30 min', rating: 4.8, priceRange: '₪₪',
                image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Classic Cheeseburger', description: 'Juicy beef patty, cheddar, lettuce, tomato, house sauce.', price: 45.00, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Truffle Fries', description: 'Crispy fries tossed in truffle oil and parmesan.', price: 25.00, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Vanilla Milkshake', description: 'Thick vanilla milkshake with whipped cream.', price: 22.00, image: 'https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&q=80&w=500' }
                ]
            },
            {
                name: 'Sushi Master', category: 'Sushi',
                description: 'Authentic Japanese sushi and sashimi.',
                address: { name: '456 Ocean Ave', latitude: 32.0853, longitude: 34.7818 },
                deliveryTime: '40-55 min', rating: 4.9, priceRange: '₪₪₪',
                image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Spicy Tuna Roll', description: 'Fresh tuna, spicy mayo, cucumber.', price: 55.00, image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Dragon Roll', description: 'Eel, cucumber, topped with avocado and sweet sauce.', price: 68.00, image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Miso Soup', description: 'Traditional Japanese soup with tofu and wakame.', price: 18.00, image: 'https://images.unsplash.com/photo-1680137248903-7af5d51a3350?auto=format&fit=crop&q=80&w=500' }
                ]
            },
            {
                name: 'Napoli Pizza', category: 'Pizza',
                description: 'Wood-fired Neapolitan style pizza.',
                address: { name: '789 Pizza Lane', latitude: 32.0614, longitude: 34.7716 },
                deliveryTime: '25-40 min', rating: 4.6, priceRange: '₪₪',
                image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Margherita Pizza', description: 'San Marzano tomato sauce, fresh mozzarella, basil.', price: 65.00, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Pepperoni Pizza', description: 'Classic cheese pizza loaded with crispy pepperoni.', price: 75.00, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Garlic Bread', description: 'Freshly baked bread infused with garlic and butter.', price: 24.00, image: 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?auto=format&fit=crop&q=80&w=500' }
                ]
            },
            {
                name: 'Taco Fiesta', category: 'Mexican',
                description: 'Authentic Mexican street tacos and burritos.',
                address: { name: '321 Salsa Blvd', latitude: 32.1093, longitude: 34.8555 },
                deliveryTime: '15-25 min', rating: 4.7, priceRange: '₪',
                image: 'https://images.unsplash.com/photo-1629486543594-a11f83fdc4e3?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Carne Asada Taco', description: 'Grilled steak, onions, cilantro.', price: 18.00, image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Chicken Burrito', description: 'Rice, beans, chicken, cheese, salsa.', price: 42.00, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Guacamole & Chips', description: 'Freshly mashed avocado with homemade tortilla chips.', price: 28.00, image: 'https://images.unsplash.com/photo-1595016111459-799a195e7452?auto=format&fit=crop&q=80&w=500' }
                ]
            },
            {
                name: 'Vegan Bites', category: 'Healthy',
                description: 'Healthy and delicious plant-based meals.',
                address: { name: '654 Green Way', latitude: 32.0660, longitude: 34.7740 },
                deliveryTime: '20-35 min', rating: 4.8, priceRange: '₪₪',
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Quinoa Bowl', description: 'Mixed greens, quinoa, roasted sweet potato, tahini.', price: 54.00, image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Avocado Toast', description: 'Sourdough, smashed avocado, cherry tomatoes.', price: 38.00, image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Green Smoothie', description: 'Spinach, kale, apple, and ginger.', price: 26.00, image: 'https://images.unsplash.com/photo-1610622930110-3c076902312a?auto=format&fit=crop&q=80&w=500' }
                ]
            },
            {
                name: 'The Sweet Spot', category: 'Desserts',
                description: 'Artisanal desserts, cakes, and pastries.',
                address: { name: '987 Sugar Ave', latitude: 32.0500, longitude: 34.7600 },
                deliveryTime: '10-20 min', rating: 4.9, priceRange: '₪₪',
                image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey center.', price: 34.00, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Fruit Tart', description: 'Shortbread crust, vanilla custard, seasonal fruit.', price: 28.00, image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&q=80&w=500' },
                    { name: 'French Macarons', description: 'Assortment of 6 colorful macarons.', price: 45.00, image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=500' }
                ]
            },
            {
                name: 'Pasta Paradise', category: 'Italian',
                description: 'Authentic handmade pasta and rich sauces.',
                address: { name: '111 Roma St', latitude: 32.0720, longitude: 34.7750 },
                deliveryTime: '30-45 min', rating: 4.7, priceRange: '₪₪₪',
                image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Spaghetti Carbonara', description: 'Pancetta, egg yolk, pecorino cheese, black pepper.', price: 62.00, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Classic Lasagna', description: 'Layered pasta, rich bolognese sauce, ricotta, mozzarella.', price: 68.00, image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Tiramisu', description: 'Espresso-soaked ladyfingers, mascarpone cream, cocoa.', price: 32.00, image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&q=80&w=500' }
                ]
            },
            {
                name: 'Curry House', category: 'Indian',
                description: 'Rich and spicy Indian curries and tandoori.',
                address: { name: '222 Spice Rd', latitude: 32.0800, longitude: 34.7700 },
                deliveryTime: '35-50 min', rating: 4.6, priceRange: '₪₪',
                image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Chicken Tikka Masala', description: 'Roasted marinated chicken chunks in spiced curry sauce.', price: 58.00, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Garlic Naan', description: 'Soft flatbread baked in a tandoor, brushed with garlic butter.', price: 15.00, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Vegetable Samosas', description: 'Crispy pastry filled with spiced potatoes and peas.', price: 22.00, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=500' }
                ]
            },
            {
                name: 'Wok This Way', category: 'Asian',
                description: 'Stir-fries, noodles, and authentic Asian street food.',
                address: { name: '333 Dragon Alley', latitude: 32.0600, longitude: 34.7800 },
                deliveryTime: '20-35 min', rating: 4.5, priceRange: '₪₪',
                image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Pad Thai', description: 'Rice noodles, egg, peanuts, bean sprouts, tamarind sauce.', price: 52.00, image: 'https://images.unsplash.com/photo-1637806930600-37fa8892069d?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Spring Rolls', description: 'Crispy fried rolls filled with mixed vegetables.', price: 24.00, image: 'https://images.unsplash.com/photo-1695712641569-05eee7b37b6d?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Pork Dumplings', description: 'Steamed dumplings filled with pork and cabbage.', price: 35.00, image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&q=80&w=500' }
                ]
            },
            {
                name: 'Mediterranean Grill', category: 'Middle Eastern',
                description: 'Fresh grilled meats, hummus, and warm pita.',
                address: { name: '444 Olive Tree St', latitude: 32.0650, longitude: 34.7900 },
                deliveryTime: '15-30 min', rating: 4.8, priceRange: '₪₪',
                image: 'https://images.unsplash.com/photo-1761773538886-e96d5a45ff49?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Chicken Shawarma Wrap', description: 'Spiced chicken, hummus, pickles, tahini in a warm pita.', price: 38.00, image: 'https://images.unsplash.com/photo-1719282431565-3b30bb7d2658?auto=format&fit=crop&q=80&w=500' }, // Reusing an image
                    { name: 'Hummus Plate', description: 'Creamy hummus topped with olive oil, chickpeas, and warm pita.', price: 28.00, image: 'https://images.unsplash.com/photo-1637949385162-e416fb15b2ce?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Falafel Balls', description: 'Crispy fried chickpea balls, side of tahini.', price: 22.00, image: 'https://images.unsplash.com/photo-1593001872095-7d5b3868fb1d?auto=format&fit=crop&q=80&w=500' }
                ]
            },
            {
                name: 'Steakhouse 99', category: 'Steakhouse',
                description: 'Prime cuts of beef grilled to perfection.',
                address: { name: '555 Prime Ave', latitude: 32.0900, longitude: 34.7800 },
                deliveryTime: '45-60 min', rating: 4.9, priceRange: '₪₪₪₪',
                image: 'https://images.unsplash.com/photo-1776983585299-631c53fbee9a?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Ribeye Steak', description: '12oz prime ribeye, cooked to order with herb butter.', price: 140.00, image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Mashed Potatoes', description: 'Creamy buttery mashed potatoes.', price: 25.00, image: 'https://images.unsplash.com/photo-1707616954324-99c89a78a20d?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Caesar Salad', description: 'Crisp romaine, parmesan, croutons, creamy dressing.', price: 42.00, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=500' }
                ]
            },
            {
                name: 'Breakfast Club', category: 'Breakfast',
                description: 'All-day breakfast, pancakes, and brunch classics.',
                address: { name: '666 Morning Way', latitude: 32.0850, longitude: 34.7900 },
                deliveryTime: '15-25 min', rating: 4.7, priceRange: '₪₪',
                image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Blueberry Pancakes', description: 'Fluffy buttermilk pancakes loaded with fresh blueberries.', price: 42.00, image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Eggs Benedict', description: 'Poached eggs, ham, English muffin, hollandaise sauce.', price: 55.00, image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice.', price: 18.00, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=500' }
                ]
            },
            {
                name: 'Seafood Catch', category: 'Seafood',
                description: 'Fresh seafood, fish and chips, and clam chowder.',
                address: { name: '777 Harbor Dr', latitude: 32.0550, longitude: 34.7550 },
                deliveryTime: '30-45 min', rating: 4.6, priceRange: '₪₪₪',
                image: 'https://images.unsplash.com/photo-1779333863055-9aaeb540cc4a?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Grilled Salmon', description: 'Atlantic salmon fillet, lemon butter, asparagus.', price: 85.00, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Fish and Chips', description: 'Beer-battered cod, thick cut fries, tartar sauce.', price: 65.00, image: 'https://images.unsplash.com/photo-1579208030886-b937da0925dc?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Clam Chowder', description: 'Creamy New England style clam chowder.', price: 38.00, image: 'https://images.unsplash.com/photo-1560684352-8497838a2229?auto=format&fit=crop&q=80&w=500' }
                ]
            },
            {
                name: 'Sandwich Bros', category: 'Sandwiches',
                description: 'Overstuffed deli sandwiches and subs.',
                address: { name: '888 Deli Ln', latitude: 32.0750, longitude: 34.7850 },
                deliveryTime: '15-25 min', rating: 4.5, priceRange: '₪',
                image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Turkey Club Sandwich', description: 'Roasted turkey, bacon, lettuce, tomato, mayo, sourdough.', price: 48.00, image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&q=80&w=500' },
                    { name: 'BLT', description: 'Crispy bacon, lettuce, tomato, toasted brioche.', price: 38.00, image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Onion Rings', description: 'Thick cut beer-battered onion rings.', price: 22.00, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&q=80&w=500' }
                ]
            },
            {
                name: 'Coffee Corner', category: 'Cafe',
                description: 'Specialty coffee, pastries, and light bites.',
                address: { name: '999 Bean Blvd', latitude: 32.0680, longitude: 34.7780 },
                deliveryTime: '10-20 min', rating: 4.8, priceRange: '₪',
                image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800',
                products: [
                    { name: 'Cappuccino', description: 'Rich espresso topped with steamed milk foam.', price: 16.00, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Butter Croissant', description: 'Flaky, buttery, freshly baked croissant.', price: 14.00, image: 'https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&q=80&w=500' },
                    { name: 'Cold Brew', description: 'Slow-steeped cold brew coffee over ice.', price: 18.00, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=500' }
                ]
            }
        ];

        for (const r of restaurantsData) {
            const created = await Restaurant.create({
                name: r.name,
                description: r.description,
                address: r.address,
                category: r.category,
                deliveryTime: r.deliveryTime,
                rating: r.rating,
                priceRange: r.priceRange,
                image: r.image,
                ownerId: adminUser._id, // Assign to admin
            });
            for (let i = 0; i < r.products.length; i++) {
                const p = r.products[i];
                const categories = ['Most Ordered', 'Mains', 'Extras'];
                await Product.create({
                    restaurantId: created._id,
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    category: categories[i % categories.length],
                    image: p.image // Uniquely assigned
                });
            }
        }

        console.log('Database successfully seeded with prime Mongoose showcase data!');
    } catch (err) {
        console.error('Failed to seed database:', err);
    }
};

module.exports = seedDatabase;
