/**
 * Formats a value as Israeli Shekels, e.g. 42 -> "₪42.00".
 *
 * Single source of truth for currency formatting across the app (menu, cart,
 * checkout, orders, search). Returns an empty string for missing / non-numeric
 * values so callers render gracefully when the server omits a price.
 */
export const formatPrice = (value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return '';
    return `₪${n.toFixed(2)}`;
};
