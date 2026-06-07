import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../utils/api';
import { authHeaders } from '../utils/auth';
import './Orders.css';
import { formatPrice } from '../utils/format';

const orderTotal = (items = []) =>
    items.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.quantity || 0), 0);

/**
 * PRS-158 — Past orders ("My orders", /orders).
 *
 * Protected route: loads the authenticated user's orders from the Ex3 server
 * and lists them newest-first with their items, total and status.
 */
const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await apiCall('/api/orders', { headers: authHeaders() });
                if (!cancelled) setOrders(data || []);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Failed to load your orders.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    if (loading) return <div className="orders-status">Loading your orders…</div>;
    if (error) return <div className="orders-status orders-status--error">{error}</div>;

    if (orders.length === 0) {
        return (
            <div className="orders-empty">
                <h2>No orders yet</h2>
                <Link to="/" className="orders-link">Browse restaurants →</Link>
            </div>
        );
    }

    // Newest first.
    const sorted = [...orders].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return (
        <div className="orders-page">
            <h1 className="orders-title">My orders</h1>

            {sorted.map((order) => (
                <div key={order.id} className="order-card">
                    <div className="order-card__head">
                        <span className={`order-status order-status--${order.status}`}>
                            {order.status}
                        </span>
                        <span className="order-card__date">
                            {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                        </span>
                    </div>

                    <ul className="order-card__items">
                        {(order.items || []).map((item, idx) => (
                            <li key={idx}>
                                <span>{item.quantity} × {item.name}</span>
                                <span>{formatPrice((Number(item.price) || 0) * (item.quantity || 0))}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="order-card__total">
                        <span>Total</span>
                        <span>{formatPrice(orderTotal(order.items))}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrdersPage;
