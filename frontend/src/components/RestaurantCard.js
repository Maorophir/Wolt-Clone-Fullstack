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
 * opens that restaurant's menu . Renders only real server fields and
 * hides any that are missing.
 */
const RestaurantCard = ({ restaurant }) => {
    const { id, name, description, address, rating, image } = restaurant;

    return (
        <Link
            to={`/restaurant/${id}`}
            className="restaurant-card"
            aria-label={name ? `View ${name}` : 'View restaurant'}
        >
            <div
                className="restaurant-card__banner"
                style={image ? {} : { background: pickGradient(name) }}
                aria-hidden="true"
            >
                {image ? (
                    <img
                        src={image}
                        alt={name || 'Restaurant'}
                        className="restaurant-card__image"
                    />
                ) : (
                    <span className="restaurant-card__initial">
                        {name ? name.charAt(0).toUpperCase() : '🍽'}
                    </span>
                )}
            </div>

            <div className="restaurant-card__body">
                <div className="restaurant-card__top">
                    <h3 className="restaurant-card__name">{name}</h3>
                    {rating > 0 ? (
                        <span className="restaurant-card__rating">★ {rating}</span>
                    ) : rating === 0 ? (
                        <span className="restaurant-card__rating" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            background: 'linear-gradient(135deg, #00C2E8, #009de0)',
                            color: 'white',
                            padding: '3px 7px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0, 194, 232, 0.3)'
                        }}>
                            New
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </span>
                    ) : null}
                </div>
                {description && <p className="restaurant-card__desc">{description}</p>}
                {address && <span className="restaurant-card__address">📍 {address}</span>}
            </div>
        </Link>
    );
};

export default RestaurantCard;
