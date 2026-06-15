import React, { useRef, useState, useEffect } from 'react';

// Emoji icons are presentational only; the category VALUES come from the
// server data (see Home), so nothing here is hard-coded restaurant content.
const ICONS = {
    Pizza: '🍕',
    Sushi: '🍣',
    Burgers: '🍔',
    Healthy: '🥗',
    Mexican: '🌮',
    Asian: '🍜',
    Desserts: '🍰',
    Italian: '🍝',
    Coffee: '☕',
    Breakfast: '🍳',
    Indian: '🍛',
    Vegan: '🥬',
    Seafood: '🦐',
    Bakery: '🥐',
    Grill: '🍖',
    Thai: '🍲',
    Mediterranean: '🥙',
    Chinese: '🥡',
};
const iconFor = (c) => ICONS[c] || '🍽️';

/**
 *Category filter row on the home feed (Wolt-style).
 *
 * The list of categories is derived from the restaurants the server returned,
 * not hard-coded. Selecting a category filters the feed; clicking the active one
 * again clears the filter.
 */
const CategoryBar = ({ categories, selected, onSelect, leading = null }) => {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [categories]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if ((!categories || categories.length === 0) && !leading) return null;

    return (
        <div className="category-container">
            <div className="category-header">
                <div className="carousel-arrows">
                    <button 
                        className={`carousel-arrow ${!canScrollLeft ? 'carousel-arrow--hidden' : ''}`}
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        aria-label="Scroll left"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button 
                        className={`carousel-arrow ${!canScrollRight ? 'carousel-arrow--hidden' : ''}`}
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        aria-label="Scroll right"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div 
                className="category-bar" 
                role="tablist" 
                aria-label="Restaurant categories"
                ref={scrollRef}
                onScroll={checkScroll}
            >
                {leading}
                {categories.map((c) => {
                    const active = c === selected;
                    return (
                        <button
                            key={c}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            className={`category-tile${active ? ' category-tile--active' : ''}`}
                            onClick={() => onSelect(active ? null : c)}
                        >
                            <span className="category-tile__icon" aria-hidden="true">{iconFor(c)}</span>
                            <span className="category-tile__label">{c}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryBar;
