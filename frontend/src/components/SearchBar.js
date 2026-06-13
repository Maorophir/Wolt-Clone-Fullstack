import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './SearchBar.css';
import { useTheme } from "../context/ThemeContext";

/**
 * The top-bar search box.
 *
 * On wide screens it renders as a full pill input.
 * On small screens (≤ 800px) it collapses to a circular icon button;
 * clicking it expands the input and focuses it. Clicking outside or pressing
 * Escape collapses it again.
 */
const SearchBar = () => {
    const inputRef = useRef(null);
    const formRef = useRef(null);
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const activeQuery = params.get('q') || '';

    // Whether the collapsed icon has been tapped open
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (inputRef.current) inputRef.current.value = activeQuery;
    }, [activeQuery]);

    // Auto-focus when the user expands it
    useEffect(() => {
        if (expanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [expanded]);

    // Collapse when clicking outside
    const handleClickOutside = useCallback((e) => {
        if (formRef.current && !formRef.current.contains(e.target)) {
            setExpanded(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    // Collapse on Escape key
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') setExpanded(false);
    };

    const handleIconClick = (e) => {
        // On small screens, toggle expansion. On large screens, just submit.
        if (window.innerWidth <= 800 && !expanded) {
            e.preventDefault();
            setExpanded(true);
            return;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const query = inputRef.current?.value.trim();
        if (query) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setExpanded(false);
        }
    };

    return (
        <form
            ref={formRef}
            className={`searchbar ${expanded ? 'searchbar--expanded' : ''}`}
            data-theme={isDarkMode ? 'dark' : 'light'}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            role="search"
        >
            <button
                type="submit"
                className="searchbar__btn"
                aria-label="Search"
                onClick={handleIconClick}
            >
                <span className="searchbar__icon"></span>
            </button>
            <input
                ref={inputRef}
                type="search"
                className="searchbar__input"
                placeholder="Search in Wolt..."
                aria-label="Search restaurants or items"
                defaultValue={activeQuery}
            />
        </form>
    );
};

export default SearchBar;
