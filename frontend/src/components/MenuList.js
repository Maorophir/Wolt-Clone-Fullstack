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
    if (!products || products.length === 0) {
        return <p className="menu-empty">This restaurant has no menu items yet.</p>;
    }

    return (
        <section className="menu-list">
            <h2 className="menu-list__title">Menu</h2>
            <div className="menu-list__grid">
                {products.map((product) => (
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
