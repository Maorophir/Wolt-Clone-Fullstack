/**
 * Formats a value as Israeli Shekels, e.g. 42 -> "₪42.00".
 *
 * Single source of truth for currency formatting across the app (menu, cart,
 * checkout, orders, search). Mirrors the web app's utils/format.js so both
 * clients render prices identically.
 */
export const formatPrice = (value) => {
    const num = Number(value);
    return isNaN(num) ? '₪0.00' : `₪${num.toFixed(2)}`;
};
