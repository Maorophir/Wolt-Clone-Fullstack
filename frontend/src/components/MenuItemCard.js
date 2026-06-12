import React from 'react';
import { formatPrice } from '../utils/format';

/**
 * A single menu item (dish) inside a restaurant's menu.
 *
 * Presentational component: it owns no state. It receives one `product` and an
 * `onAddToCart` callback supplied by the page. This keeps the cart logic out of
 * the card (will wire `onAddToCart` to the cart context).
 *
 * `isAvailable` defaults to "available" and only disables the button when the
 * server explicitly sends `false`, so older items without the field still work.
 */
const MenuItemCard = ({ product, onAddToCart }) => {
    const { name, description, price, isAvailable, image } = product;
    const available = isAvailable !== false;

    return (
        <article className={`menu-item${available ? '' : ' menu-item--unavailable'}`}>
            {image && (
                <img
                    src={image}
                    alt={name || 'Dish'}
                    className="menu-item__image"
                />
            )}
            <div className="menu-item__body">
                <h3 className="menu-item__name">{name}</h3>
                {description && <p className="menu-item__desc">{description}</p>}
                <span className="menu-item__price">{formatPrice(price)}</span>
            </div>

            <button
                type="button"
                className="menu-item__add"
                disabled={!available}
                onClick={() => onAddToCart(product)}
            >
                {available ? 'Add to cart' : 'Unavailable'}
            </button>
        </article>
    );
};

export default MenuItemCard;
