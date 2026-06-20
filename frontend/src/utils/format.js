/**
 * Formats a value as Israeli Shekels, e.g. 42 -> "₪42.00".
 *
 * Single source of truth for currency formatting across the app (menu, cart,
 * checkout, orders, search). Returns an empty string for missing / non-numeric
 * values so callers render gracefully when the server omits a price.
 */
export const formatPrice = (value) => {
    const num = Number(value);
    return isNaN(num) ? '₪0.00' : `₪${num.toFixed(2)}`;
};
