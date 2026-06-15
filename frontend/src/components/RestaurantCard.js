import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistance } from '../utils/geo';
import { StarIcon, ClockIcon, PinIcon, HeartIcon } from './icons';
import './RestaurantCard.css';

// Deterministic gradient for restaurants without an image, so the fallback
// banner is stable + varied (we only use legal/free images for real photos).
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
    for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return GRADIENTS[hash % GRADIENTS.length];
};

/**
 * Wolt-style restaurant tile: image-forward, with a meta row (rating · delivery
 * time · price) under the name and an optional "X km away" chip on the image
 * when the user has shared their location. Uses crisp inline SVG icons.
 */
const RestaurantCard = ({ restaurant, distanceKm }) => {
    const { id, name, rating, image, deliveryTime, priceRange } = restaurant;
    const isNew = !(Number(rating) > 0);

    return (
        <Link
            to={`/restaurant/${id}`}
            className="restaurant-card"
            aria-label={name ? `View ${name}` : 'View restaurant'}
        >
            <div
                className="restaurant-card__media"
                style={image ? undefined : { background: pickGradient(name) }}
            >
                {image ? (
                    <img src={image} alt="" className="restaurant-card__image" loading="lazy" />
                ) : (
                    <span className="restaurant-card__initial" aria-hidden="true">
                        {name ? name.charAt(0).toUpperCase() : '?'}
                    </span>
                )}

                <span className="restaurant-card__fav" aria-hidden="true"><HeartIcon /></span>

                {distanceKm != null && (
                    <span className="restaurant-card__distance">
                        <PinIcon /> {formatDistance(distanceKm)}
                    </span>
                )}
            </div>

            <div className="restaurant-card__body">
                <h3 className="restaurant-card__name">{name}</h3>
                <div className="restaurant-card__meta">
                    <span className={`restaurant-card__rating${isNew ? ' restaurant-card__rating--new' : ''}`}>
                        <StarIcon /> {isNew ? 'New' : rating}
                    </span>
                    {deliveryTime && (
                        <span className="restaurant-card__meta-item"><ClockIcon /> {deliveryTime}</span>
                    )}
                    {priceRange && <span className="restaurant-card__meta-item">{priceRange}</span>}
                </div>
            </div>
        </Link>
    );
};

export default RestaurantCard;
