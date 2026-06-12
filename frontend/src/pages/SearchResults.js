import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiCall } from '../utils/api';
import RestaurantCard from '../components/RestaurantCard';
import './Home.css';
import { formatPrice } from '../utils/format';

/**
 *Search results page (/search?q=…).
 *
 * Reads the query from the URL and asks the Ex3 search endpoint, which returns a
 * mixed list of restaurants and products. Restaurants render as cards; dish
 * results link into the restaurant they belong to.
 */
const SearchResults = () => {
    const [params] = useSearchParams();
    const query = params.get('q') || '';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!query) {
            setResults([]);
            setLoading(false);
            return undefined;
        }

        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await apiCall(`/api/search/${encodeURIComponent(query)}`);
                if (!cancelled) setResults(data || []);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Search failed.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [query]);

    const restaurants = results.filter((r) => r.type === 'restaurant');
    const products = results.filter((r) => r.type === 'product');

    return (
        <div className="home">
            <h1 className="search-title">Results for “{query}”</h1>

            {loading ? (
                <div className="home-status">Searching…</div>
            ) : error ? (
                <div className="home-status home-status--error">{error}</div>
            ) : results.length === 0 ? (
                <p className="home-empty">No restaurants or dishes match “{query}”.</p>
            ) : (
                <>
                    {restaurants.length > 0 && (
                        <section className="home-section">
                            <h2 className="home-section__title">Restaurants</h2>
                            <div className="home-grid">
                                {restaurants.map((r) => (
                                    <RestaurantCard key={r.id} restaurant={r} />
                                ))}
                            </div>
                        </section>
                    )}

                    {products.length > 0 && (
                        <section className="home-section">
                            <h2 className="home-section__title">Dishes</h2>
                            <div className="home-grid">
                                {products.map((p) => (
                                    <Link key={p.id} to={`/restaurant/${p.restaurantId}`} className="dish-result">
                                        <span className="dish-result__name">{p.name}</span>
                                        {p.description && (
                                            <span className="dish-result__desc">{p.description}</span>
                                        )}
                                        {p.price != null && (
                                            <span className="dish-result__price">{formatPrice(p.price)}</span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchResults;
