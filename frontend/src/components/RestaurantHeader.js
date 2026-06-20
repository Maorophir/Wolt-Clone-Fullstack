import React from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';
import { formatDistance } from '../utils/geo';
import { PinIcon } from './icons';

/**
 * The hero header at the top of a restaurant's menu page: name, short
 * description, rating and address. Purely presentational — it renders whatever
 * the server returned and hides fields that are missing.
 */
const RestaurantHeader = ({ restaurant, distanceKm }) => {
    if (!restaurant) return null;

    const { id, name, description, address, rating, ownerId } = restaurant;
    const currentUser = getCurrentUser();
    const isOwner = currentUser && (currentUser.id === ownerId || currentUser.isAdmin);

    return (
        <header className="restaurant-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1 className="restaurant-header__name">{name}</h1>
                {isOwner && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Link to={`/edit-restaurant/${id}`} style={{
                            background: '#f0f4f8',
                            color: '#009de0',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}>
                            Edit Restaurant
                        </Link>
                        <Link to={`/manage-menu/${id}`} style={{
                            background: '#009de0',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}>
                            Manage Menu
                        </Link>
                    </div>
                )}
            </div>

            {description && (
                <p className="restaurant-header__desc">{description}</p>
            )}

            <div className="restaurant-header__meta">
                {rating > 0 ? (
                    <span className="restaurant-header__rating">★ {rating}</span>
                ) : rating === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="restaurant-header__rating" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            background: 'linear-gradient(135deg, #00C2E8, #009de0)',
                            color: 'white',
                            padding: '3px 8px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0, 194, 232, 0.3)'
                        }}>
                            New
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-color)', opacity: 0.7, fontWeight: '500' }}>
                            Unrated yet
                        </span>
                    </div>
                ) : null}
                {address && (
                    <span className="restaurant-header__address">{address}</span>
                )}
                {distanceKm != null && (
                    <span className="restaurant-header__address" style={{ color: '#009de0', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <PinIcon /> {formatDistance(distanceKm)} away
                    </span>
                )}
            </div>
        </header>
    );
};

export default RestaurantHeader;
