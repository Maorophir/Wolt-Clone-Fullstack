import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

/**
 * The cart entry point shown in the top navbar: a cart icon with a live badge
 * of the total item count. Links to the cart page.
 */
const CartButton = () => {
    const { totalItems } = useCart();

    return (
        <Link to="/cart" className="cart-button" aria-label={`Cart (${totalItems} items)`}>
            🛒
            {totalItems > 0 && <span className="cart-button__badge">{totalItems}</span>}
        </Link>
    );
};

export default CartButton;
