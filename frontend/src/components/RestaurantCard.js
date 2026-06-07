import React from 'react';
import { Link } from 'react-router-dom';
import './RestaurantCard.css';

// A small palette of pleasant gradients. We have no image data for restaurants
// (and may only use legal/free images), so each card gets a deterministic
// gradient banner + initial derived from its name — stable and varied.
const GRADIENTS = [
    'linear-gradient(135deg, #ff9a9e, #fad0c4)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'linear-gradient(135deg, #84fab0, #8fd3f4)',
    'linear-gradient(135deg, #ffecd2, #fcb69f)',
    'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
    'linear-gradient(135deg, #f6d365, #fda085)',
    'linear-gradient(135deg, #d4fc79, #96e6a1)',
    'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
];

const pickGradient = (key = '') => {
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
        hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    return GRADIENTS[hash % GRADIENTS.length];
};

/**
 * A restaurant tile used on the home feed and in search results. Clicking it
 * opens that restaurant's menu (PRS-159). Renders only real server fields and
 * hides any that are missing.
 */
const RestaurantCard = ({ restaurant }) => {
    const { id, name, description, address, rating } = restaurant;

    return (
        <Link
            to={`/restaurant/${id}`}
            className="restaurant-card"
            aria-label={name ? `View ${name}` : 'View restaurant'}
        >
            <div
                className="restaurant-card__banner"
                style={{ background: pickGradient(name) }}
                aria-hidden="true"
            >
                <span className="restaurant-card__initial">
                    {name ? name.charAt(0).toUpperCase() : '🍽'}
                </span>
            </div>

            <div className="restaurant-card__body">
                <div className="restaurant-card__top">
                    <h3 className="restaurant-card__name">{name}</h3>
                    {rating != null && rating !== '' && (
                        <span className="restaurant-card__rating">★ {rating}</span>
                    )}
                </div>
                {description && <p className="restaurant-card__desc">{description}</p>}
                {address && <span className="restaurant-card__address">📍 {address}</span>}
            </div>
        </Link>
    );
};

export default RestaurantCard;
