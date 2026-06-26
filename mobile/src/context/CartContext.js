import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getId } from '../utils/id';

/**
 * Shopping-cart state, shared app-wide. Ports the web CartContext.
 *
 * A cart holds items from a SINGLE restaurant (the real Wolt rule; the server's
 * POST /orders takes exactly one restaurantId). React Native has no synchronous
 * `window.confirm`, so instead of confirming inside the context, `addItem`
 * returns 'conflict' and the screen shows an Alert, then calls `replaceCartWith`.
 * Persisted to AsyncStorage (async) so it survives app restarts.
 */
const CartContext = createContext(null);
const STORAGE_KEY = 'wolt_cart';
const EMPTY_CART = { restaurantId: null, restaurantName: '', items: [] };

const makeItem = (product) => ({
    productId: getId(product),
    name: product.name,
    price: Number(product.price) || 0,
    quantity: 1,
});

const restIdOf = (product, restaurant) =>
    product.restaurantId || getId(restaurant) || null;

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(EMPTY_CART);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (raw) setCart(JSON.parse(raw));
            } catch {
                /* ignore */
            } finally {
                setHydrated(true);
            }
        })();
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cart)).catch(() => {});
    }, [cart, hydrated]);

    /** Start a fresh single-restaurant cart with this product. */
    const replaceCartWith = (product, restaurant) => {
        setCart({
            restaurantId: restIdOf(product, restaurant),
            restaurantName: restaurant?.name || '',
            items: [makeItem(product)],
        });
    };

    /**
     * Add a product. Returns 'added', or 'conflict' when the cart already holds
     * items from a different restaurant (the screen then confirms via Alert and
     * calls replaceCartWith).
     */
    const addItem = (product, restaurant) => {
        const restId = restIdOf(product, restaurant);
        const restName = restaurant?.name || '';

        if (cart.items.length > 0 && cart.restaurantId !== restId) {
            return 'conflict';
        }

        const pid = getId(product);
        setCart((prev) => {
            const existing = prev.items.find((i) => i.productId === pid);
            const items = existing
                ? prev.items.map((i) =>
                    i.productId === pid ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev.items, makeItem(product)];
            return {
                restaurantId: restId,
                restaurantName: restName || prev.restaurantName,
                items,
            };
        });
        return 'added';
    };

    /** Set an item's quantity; <= 0 removes it (emptying the cart if it was last). */
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
    const totalPrice = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

    const value = {
        cart,
        addItem,
        replaceCartWith,
        setQuantity,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within a CartProvider');
    return ctx;
};
