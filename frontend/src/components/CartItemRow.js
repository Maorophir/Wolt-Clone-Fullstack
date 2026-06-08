import React from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

/**
 * A single line in the cart: name, unit price, quantity stepper, line subtotal
 * and a remove button. Delegates all mutations to the cart context.
 */
const CartItemRow = ({ item }) => {
    const { setQuantity, removeItem } = useCart();

    return (
        <div className="cart-row">
            <div className="cart-row__info">
                <span className="cart-row__name">{item.name}</span>
                <span className="cart-row__price">{formatPrice(item.price)} each</span>
            </div>

            <div className="cart-row__qty">
                <button
                    type="button"
                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    aria-label="Decrease quantity"
                >
                    −
                </button>
                <span>{item.quantity}</span>
                <button
                    type="button"
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    aria-label="Increase quantity"
                >
                    +
                </button>
            </div>

            <span className="cart-row__subtotal">{formatPrice(item.price * item.quantity)}</span>

            <button
                type="button"
                className="cart-row__remove"
                onClick={() => removeItem(item.productId)}
                aria-label={`Remove ${item.name}`}
            >
                ✕
            </button>
        </div>
    );
};

export default CartItemRow;
