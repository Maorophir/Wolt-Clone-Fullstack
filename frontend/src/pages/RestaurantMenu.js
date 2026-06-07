import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiCall } from '../utils/api';
import { useCart } from '../context/CartContext';
import RestaurantHeader from '../components/RestaurantHeader';
import MenuList from '../components/MenuList';
import './RestaurantMenu.css';

/**
 * PRS-159 — Restaurant Menu View.
 *
 * Page at /restaurant/:id. Loads a single restaurant and its menu from the
 * Ex3 server (no hard-coded data) and renders them. Browsing is public, so this
 * page makes no authenticated calls.
 *
 * Owns the page-level UI state:
 *   - restaurant / products : data fetched from the server
 *   - loading / error       : request lifecycle, surfaced clearly to the user
 *   - toast                 : transient "added to cart" confirmation
 *
 * "Add to cart" is wired to the PRS-160 cart context.
 */
const RestaurantMenu = () => {
    const { id } = useParams();
    const { addItem } = useCart();

    const [restaurant, setRestaurant] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');

    // Holds the active toast's timeout id across renders so rapid "Add" clicks
    // reset the timer instead of stacking. (Required useRef usage.)
    const toastTimer = useRef(null);

    // Fetch the restaurant and its menu whenever the :id in the URL changes.
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const [restaurantData, productsData] = await Promise.all([
                    apiCall(`/api/restaurants/${id}`),
                    apiCall(`/api/restaurants/${id}/products`),
                ]);
                if (!cancelled) {
                    setRestaurant(restaurantData);
                    setProducts(productsData);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || 'Failed to load this restaurant.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        // Ignore a late response if the user navigated away mid-request.
        return () => {
            cancelled = true;
        };
    }, [id]);

    // Clear any pending toast timer when the page unmounts.
    useEffect(() => {
        return () => {
            if (toastTimer.current) clearTimeout(toastTimer.current);
        };
    }, []);

    const handleAddToCart = (product) => {
        // Single-restaurant cart: addItem returns false if the user declined to
        // replace a cart from a different restaurant — only confirm on a real add.
        const added = addItem(product, restaurant);
        if (added === false) return;

        setToast(`${product.name} added to cart`);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(''), 2000);
    };

    if (loading) {
        return <div className="menu-status">Loading menu…</div>;
    }

    if (error) {
        return (
            <div className="menu-status menu-status--error">
                <p>{error}</p>
                <Link to="/" className="menu-back-link">← Back to restaurants</Link>
            </div>
        );
    }

    return (
        <div className="restaurant-menu-page">
            <Link to="/" className="menu-back-link">← Back to restaurants</Link>

            <RestaurantHeader restaurant={restaurant} />
            <MenuList products={products} onAddToCart={handleAddToCart} />

            {toast && <div className="menu-toast" role="status">{toast}</div>}
        </div>
    );
};

export default RestaurantMenu;
