import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { apiCall } from '../utils/api';
import { authHeaders, getCurrentUser } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import { formatPrice } from '../utils/format';

/**
 *Checkout page (/checkout). Reachable only by a logged-in user
 * (wrapped in <ProtectedRoute>). Shows the final order summary and places the
 * order against the Ex3 server: POST /api/orders with the authenticated user's
 * credential. On success it clears the cart and shows the confirmation page.
 */
const CheckoutPage = () => {
    const { cart, totalItems, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState('');

    const user = getCurrentUser();

    if (totalItems === 0) {
        return (
            <div className="cart-page cart-empty">
                <h2>Your cart is empty</h2>
            </div>
        );
    }

    const placeOrder = async () => {
        setPlacing(true);
        setError('');
        try {
            await apiCall('/api/orders', {
                method: 'POST',
                headers: authHeaders(),
                body: {
                    restaurantId: cart.restaurantId,
                    items: cart.items.map((i) => ({
                        productId: i.productId,
                        name: i.name,
                        price: i.price,
                        quantity: i.quantity,
                    })),
                },
            });
            clearCart();
            navigate('/order-confirmation', { replace: true });
        } catch (err) {
            setError(err.message || 'Could not place your order. Please try again.');
        } finally {
            setPlacing(false);
        }
    };

    return (
        <div className="cart-page">
            <h2 className="cart-title">Checkout</h2>
            {user && (
                <p className="checkout-user">
                    Ordering as <strong>{user.name || user.email}</strong>
                </p>
            )}

            <div className="cart-items">
                {cart.items.map((i) => (
                    <div className="checkout-line" key={i.productId}>
                        <span>{i.quantity} × {i.name}</span>
                        <span>{formatPrice(i.price * i.quantity)}</span>
                    </div>
                ))}
            </div>

            <div className="cart-summary">
                <span>Total</span>
                <span className="cart-summary__total">{formatPrice(totalPrice)}</span>
            </div>

            {error && <p className="checkout-error">{error}</p>}

            <button
                type="button"
                className="cart-checkout"
                onClick={placeOrder}
                disabled={placing}
            >
                {placing ? 'Placing order…' : `Place order • ${formatPrice(totalPrice)}`}
            </button>
        </div>
    );
};

export default CheckoutPage;
