import React from 'react';

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
};
const iconFor = (c) => ICONS[c] || '🍽️';

/**
 * PRS-158 — Category filter row on the home feed (Wolt-style).
 *
 * The list of categories is derived from the restaurants the server returned,
 * not hard-coded. Selecting a category filters the feed; clicking the active one
 * again clears the filter.
 */
const CategoryBar = ({ categories, selected, onSelect }) => {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="category-bar" role="tablist" aria-label="Restaurant categories">
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
    );
};

export default CategoryBar;
