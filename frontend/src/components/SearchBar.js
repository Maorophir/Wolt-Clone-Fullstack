import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * The top-bar search box. Submitting navigates to the search results page with
 * the query in the URL (so results are shareable / bookmarkable and Router
 * handles it without a refresh).
 *
 * Uses useRef to read the (uncontrolled) input on submit, and keeps the box in
 * sync with the active ?q= so a shared link shows its query in the navbar.
 */
const SearchBar = () => {
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const activeQuery = params.get('q') || '';

    useEffect(() => {
        if (inputRef.current) inputRef.current.value = activeQuery;
    }, [activeQuery]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const query = inputRef.current.value.trim();
        if (query) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form className="searchbar" onSubmit={handleSubmit} role="search">
            <button type="submit" className="searchbar__btn" aria-label="Search">🔍</button>
            <input
                ref={inputRef}
                type="search"
                className="searchbar__input"
                placeholder="Search restaurants or dishes…"
                aria-label="Search restaurants or dishes"
                defaultValue={activeQuery}
            />
        </form>
    );
};

export default SearchBar;
