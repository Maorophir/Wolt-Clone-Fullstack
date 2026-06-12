import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 *Shopping cart state, shared across the whole app via React Context.
 *
 * A cart holds items from a SINGLE restaurant (the real Wolt rule, and the Ex3
 * `POST /api/orders` endpoint takes exactly one restaurantId). Adding an item
 * from a different restaurant asks the user to start a fresh cart.
 *
 * The cart is persisted to localStorage so it survives a manual page reload
 * (the SPA itself never refreshes, thanks to the Router).
 */
const CartContext = createContext(null);

const STORAGE_KEY = 'wolt_cart';
const EMPTY_CART = { restaurantId: null, restaurantName: '', items: [] };

const loadCart = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : EMPTY_CART;
    } catch {
        return EMPTY_CART;
    }
};

const makeItem = (product) => ({
    productId: product.id,
    name: product.name,
    price: Number(product.price) || 0,
    quantity: 1,
});

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(loadCart);

    // Keep localStorage in sync with the cart on every change.
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }, [cart]);

    /**
     * Add a product to the cart. `restaurant` ({ id, name }) is optional context
     * used for the single-restaurant rule and for display. Returns false if the
     * user declined to replace a cart from another restaurant.
     */
    const addItem = (product, restaurant) => {
        const restId = product.restaurantId || restaurant?.id || null;
        const restName = restaurant?.name || '';

        // Different restaurant than what's already in the cart -> confirm replace.
        if (cart.items.length > 0 && cart.restaurantId !== restId) {
            const ok = window.confirm(
                `Your cart has items from ${cart.restaurantName || 'another restaurant'}. ` +
                `Start a new cart${restName ? ` with ${restName}` : ''}?`
            );
            if (!ok) return false;
            setCart({ restaurantId: restId, restaurantName: restName, items: [makeItem(product)] });
            return true;
        }

        setCart((prev) => {
            const existing = prev.items.find((i) => i.productId === product.id);
            const items = existing
                ? prev.items.map((i) =>
                    i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev.items, makeItem(product)];
            return {
                restaurantId: restId,
                restaurantName: restName || prev.restaurantName,
                items,
            };
        });
        return true;
    };

    /** Set an item's quantity; quantity <= 0 removes it (and empties the cart if last). */
    const setQuantity = (productId, quantity) => {
        setCart((prev) => {
            if (quantity <= 0) {
                const items = prev.items.filter((i) => i.productId !== productId);
                return items.length ? { ...prev, items } : EMPTY_CART;
            }
            return {
                ...prev,
                items: prev.items.map((i) =>
                    i.productId === productId ? { ...i, quantity } : i),
            };
        });
    };

    const removeItem = (productId) => setQuantity(productId, 0);
    const clearCart = () => setCart(EMPTY_CART);

    const totalItems = cart.items.reduce((n, i) => n + i.quantity, 0);
    const totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const value = { cart, addItem, setQuantity, removeItem, clearCart, totalItems, totalPrice };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/** Hook for consuming the cart from any component inside <CartProvider>. */
export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return ctx;
};
