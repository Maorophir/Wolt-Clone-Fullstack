import React from 'react';
import { Link } from 'react-router-dom';
import './Cart.css';

/**
 *Order confirmation (/order-confirmation). Shown after an order is
 * successfully placed. Past orders themselves live in the orders history
 * .
 */
const OrderConfirmation = () => (
    <div className="cart-page order-confirmation">
        <div className="confirmation-check">✓</div>
        <h2>Order placed!</h2>
        <p>Your order has been sent to the restaurant.</p>
        <Link to="/" className="cart-checkout cart-checkout--link">Back to restaurants</Link>
    </div>
);

export default OrderConfirmation;
