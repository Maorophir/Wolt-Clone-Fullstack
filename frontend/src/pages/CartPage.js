import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItemRow from '../components/CartItemRow';
import './Cart.css';
import { formatPrice } from '../utils/format';

/**
 *Cart page (/cart). Lists the items in the cart, lets the user adjust
 * quantities or clear it, shows the total, and sends them to checkout. Browsing
 * the cart is public; the auth gate is on the checkout step.
 */
const CartPage = () => {
    const { cart, totalItems, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();

    if (totalItems === 0) {
        return (
            <div className="cart-page cart-empty">
                <h2>Your cart is empty</h2>
                <Link to="/" className="cart-link">Browse restaurants →</Link>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h2 className="cart-title">
                Your order{cart.restaurantName ? ` from ${cart.restaurantName}` : ''}
            </h2>

            <div className="cart-items">
                {cart.items.map((item) => (
                    <CartItemRow key={item.productId} item={item} />
                ))}
            </div>

            <div className="cart-summary">
                <span>Total</span>
                <span className="cart-summary__total">{formatPrice(totalPrice)}</span>
            </div>

            <div className="cart-actions">
                <button type="button" className="cart-clear" onClick={clearCart}>
                    Clear cart
                </button>
                <button type="button" className="cart-checkout" onClick={() => navigate('/checkout')}>
                    Go to checkout
                </button>
            </div>
        </div>
    );
};

export default CartPage;
