import React from 'react';

/**
 * The hero header at the top of a restaurant's menu page: name, short
 * description, rating and address. Purely presentational — it renders whatever
 * the server returned and hides fields that are missing.
 */
const RestaurantHeader = ({ restaurant }) => {
    if (!restaurant) return null;

    const { name, description, address, rating } = restaurant;

    return (
        <header className="restaurant-header">
            <h1 className="restaurant-header__name">{name}</h1>

            {description && (
                <p className="restaurant-header__desc">{description}</p>
            )}

            <div className="restaurant-header__meta">
                {rating != null && rating !== '' && (
                    <span className="restaurant-header__rating">★ {rating}</span>
                )}
                {address && (
                    <span className="restaurant-header__address">{address}</span>
                )}
            </div>
        </header>
    );
};

export default RestaurantHeader;
