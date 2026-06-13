import React from 'react';
import MenuItemCard from './MenuItemCard';

/**
 * Renders the list of menu items for a restaurant as a responsive grid.
 *
 * Shows a friendly empty state when the restaurant exists but has no products
 * yet (the products endpoint returns [] for a real-but-empty restaurant).
 * Stateless: the `products` array and the `onAddToCart` handler come from the
 * page above.
 */
const MenuList = ({ products, onAddToCart }) => {
    // Only show products that are explicitly available (or undefined which defaults to available)
    const visibleProducts = products ? products.filter(p => p.isAvailable !== false) : [];

    if (visibleProducts.length === 0) {
        return <p className="menu-empty">This restaurant has no menu items yet.</p>;
    }

    return (
        <section className="menu-list">
            <h2 className="menu-list__title">Menu</h2>
            <div className="menu-list__grid">
                {visibleProducts.map((product) => (
                    <MenuItemCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                    />
                ))}
            </div>
        </section>
    );
};

export default MenuList;
