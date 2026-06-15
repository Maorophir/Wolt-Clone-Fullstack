import React, { useEffect, useState } from 'react';
import { apiCall } from '../utils/api';
import RestaurantCard from '../components/RestaurantCard';
import CategoryBar from '../components/CategoryBar';
import Carousel from '../components/Carousel';
import { useUserLocation } from '../context/LocationContext';
import { haversineKm } from '../utils/geo';
import './Home.css';

// "20-30 min" -> 20, for sorting by speed. Unknown -> Infinity (sorts last).
const parseMinutes = (dt) => {
    const m = parseInt(dt, 10);
    return Number.isFinite(m) ? m : Infinity;
};

/**
 * Home / main screen — a Wolt-style feed of horizontal card rows.
 *
 * Data is loaded from the Ex3 server (no hard-coded data). Categories are
 * derived from that data. When the user sets their location via the navbar
 * pill, each card shows its distance ("X km away"), computed with a Haversine
 * formula — no external libraries.
 */
const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [category, setCategory] = useState(null);

    const loc = useUserLocation();

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await apiCall('/api/restaurants');
                if (!cancelled) setRestaurants(data || []);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Failed to load restaurants.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    if (loading) return <div className="home-status">Loading restaurants…</div>;
    if (error) return <div className="home-status home-status--error">{error}</div>;

    const categories = [...new Set(restaurants.map((r) => r.category).filter(Boolean))].sort();

    // Once a location is set (via the navbar pill), attach a distance to every
    // restaurant that has coordinates so the card can show "X km away".
    const withDistance = loc.coords
        ? restaurants.map((r) => ({
            ...r,
            distanceKm:
                r.latitude != null && r.longitude != null
                    ? haversineKm(loc.coords, { lat: Number(r.latitude), lng: Number(r.longitude) })
                    : undefined,
        }))
        : restaurants;

    const filtered = category ? withDistance.filter((r) => r.category === category) : withDistance;

    // Derived themed rows (all from real data — nothing hard-coded).
    const popular = [...withDistance]
        .filter((r) => Number(r.rating) >= 4.5)
        .sort((a, b) => Number(b.rating) - Number(a.rating))
        .slice(0, 10);
    const fastest = [...withDistance]
        .filter((r) => r.deliveryTime)
        .sort((a, b) => parseMinutes(a.deliveryTime) - parseMinutes(b.deliveryTime))
        .slice(0, 10);

    const renderCards = (list) =>
        list.map((r) => <RestaurantCard key={r.id} restaurant={r} distanceKm={r.distanceKm} />);

    return (
        <div className="home">
            <header className="home-hero">
                <h1>Order food you love</h1>
                <p>Discover great restaurants and get your favourites delivered.</p>
            </header>

            {restaurants.length === 0 ? (
                <p className="home-empty">No restaurants available yet.</p>
            ) : (
                <>
                    <CategoryBar categories={categories} selected={category} onSelect={setCategory} />

                    {category ? (
                        <section className="home-section">
                            <h2 className="home-section__title">{category}</h2>
                            {filtered.length === 0 ? (
                                <p className="home-empty">No restaurants in this category.</p>
                            ) : (
                                <div className="home-grid">{renderCards(filtered)}</div>
                            )}
                        </section>
                    ) : (
                        <>
                            {popular.length > 0 && (
                                <Carousel title="Popular right now">{renderCards(popular)}</Carousel>
                            )}
                            {fastest.length > 0 && (
                                <Carousel title="Fastest delivery">{renderCards(fastest)}</Carousel>
                            )}
                            <section className="home-section">
                                <h2 className="home-section__title">All restaurants</h2>
                                <div className="home-grid">{renderCards(withDistance)}</div>
                            </section>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Home;
