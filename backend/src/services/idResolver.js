/**
 * UUID <-> integer id bridge for the C++ recommendation server (Exercise 2).
 *
 * Our web server identifies entities with UUID strings, but the C++ server runs
 * `std::stoi` on every userId/productId it receives, so it only accepts
 * integers. That server tracks views by user and product only, so those are the
 * two entities that need an integer surrogate.
 *
 * Surrogates are assigned lazily on first use and stay stable for the life of
 * the process. Users and products are numbered independently (a user "1" and a
 * product "1" are unrelated, exactly as the C++ server treats them). State is
 * in-memory and volatile, like the rest of the app.
 */

const createTable = () => ({ toInt: new Map(), toUuid: new Map(), next: 1 });

const users = createTable();
const products = createTable();

const resolve = (table, uuid) => {
    let intId = table.toInt.get(uuid);
    if (intId === undefined) {
        intId = table.next++;
        table.toInt.set(uuid, intId);
        table.toUuid.set(intId, uuid);
    }
    return intId;
};

// Map a user/product UUID to its integer surrogate (assigning one if needed).
const getUserInt = (userUuid) => resolve(users, userUuid);
const getProductInt = (productUuid) => resolve(products, productUuid);

// Reverse a product integer (e.g. from a C++ recommendation reply) back to its
// UUID. Returns null if the integer was never assigned.
const getProductUuid = (productInt) => products.toUuid.get(Number(productInt)) || null;

module.exports = {
    getUserInt,
    getProductInt,
    getProductUuid
};
