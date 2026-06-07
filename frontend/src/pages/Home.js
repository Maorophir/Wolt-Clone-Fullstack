import React, { useEffect, useState } from 'react';
import { apiCall } from '../utils/api';
import RestaurantCard from '../components/RestaurantCard';
import CategoryBar from '../components/CategoryBar';
import './Home.css';

/**
 * PRS-158 — Home / main screen.
 *
 * Loads all restaurants from the Ex3 server (no hard-coded data) and presents
 * them as a Wolt-style feed: a category filter row, a "Popular right now" row of
 * the top-rated places, and the full grid. The category list is derived from the
 * restaurants the server returns; selecting one filters the feed.
 */
const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [category, setCategory] = useState(null);

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

    // Categories are derived from the server data — not a hard-coded list.
    const categories = [...new Set(restaurants.map((r) => r.category).filter(Boolean))].sort();
    const visible = category ? restaurants.filter((r) => r.category === category) : restaurants;
    const promoted = [...restaurants]
        .filter((r) => Number(r.rating) >= 4.5)
        .sort((a, b) => Number(b.rating) - Number(a.rating))
        .slice(0, 8);

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

                    {!category && promoted.length > 0 && (
                        <section className="home-section">
                            <h2 className="home-section__title">Popular right now</h2>
                            <div className="home-carousel">
                                {promoted.map((r) => (
                                    <div className="home-carousel__item" key={r.id}>
                                        <RestaurantCard restaurant={r} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="home-section">
                        <h2 className="home-section__title">{category || 'All restaurants'}</h2>
                        {visible.length === 0 ? (
                            <p className="home-empty">No restaurants in this category.</p>
                        ) : (
                            <div className="home-grid">
                                {visible.map((r) => (
                                    <RestaurantCard key={r.id} restaurant={r} />
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default Home;
