import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import { useCart } from '../context/CartContext';
import { useUserLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

/**
 * Checkout (RN port of pages/CheckoutPage.js). Protected — bounces to Login if
 * the user isn't authenticated. Shows the final summary and places the order
 * (POST /orders; the JWT is auto-attached by the api client). Clears the cart and
 * shows the confirmation screen on success.
 */
export default function Checkout({ navigation }) {
    const c = useThemeColors();
    const { isAuthenticated } = useRequireAuth();
    const { user } = useAuth();
    const { cart, totalItems, totalPrice, clearCart } = useCart();
    const loc = useUserLocation();
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState('');

    if (!isAuthenticated) {
        return <Screen style={styles.center}><Text style={{ color: c.muted }}>Please log in to continue…</Text></Screen>;
    }
    if (totalItems === 0) {
        return <Screen style={styles.center}><Text style={[styles.emptyTitle, { color: c.text }]}>Your cart is empty</Text></Screen>;
    }

    const deliverTo = loc.active;

    // Shape the address for the server (addressSchema: { name, latitude, longitude }).
    // Send coords only when valid; name-only lets the server default coords to 0.
    const buildDeliveryAddress = () => {
        if (!deliverTo) return undefined;
        const lat = Number(deliverTo.lat);
        const lng = Number(deliverTo.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return { name: deliverTo.label, latitude: lat, longitude: lng };
        }
        return { name: deliverTo.label };
    };

    const placeOrder = async () => {
        setPlacing(true);
        setError('');
        try {
            await api('/orders', {
                method: 'POST',
                body: {
                    restaurantId: cart.restaurantId,
                    items: cart.items.map((i) => ({
                        productId: i.productId,
                        name: i.name,
                        price: i.price,
                        quantity: i.quantity,
                    })),
                    deliveryAddress: buildDeliveryAddress(),
                },
            });
            clearCart();
            navigation.replace('OrderConfirmation');
        } catch (err) {
            setError(err.message || 'Could not place your order. Please try again.');
        } finally {
            setPlacing(false);
        }
    };

    return (
        <Screen>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: c.text }]}>Checkout</Text>
                {user ? (
                    <Text style={[styles.sub, { color: c.muted }]}>
                        Ordering as <Text style={{ fontWeight: '700', color: c.text }}>{user.displayName || user.username}</Text>
                    </Text>
                ) : null}
                <Text style={[styles.sub, { color: c.muted }]}>
                    {deliverTo
                        ? `Deliver to ${deliverTo.label}`
                        : 'No delivery location set — pick one from the location selector on Home.'}
                </Text>

                <View style={[styles.card, { borderColor: c.border, backgroundColor: c.surface }]}>
                    {cart.items.map((i) => (
                        <View key={i.productId} style={styles.line}>
                            <Text style={[styles.lineTxt, { color: c.text }]}>{i.quantity} × {i.name}</Text>
                            <Text style={[styles.lineTxt, { color: c.text }]}>{formatPrice(i.price * i.quantity)}</Text>
                        </View>
                    ))}
                    <View style={[styles.totalRow, { borderTopColor: c.border }]}>
                        <Text style={[styles.totalLabel, { color: c.text }]}>Total</Text>
                        <Text style={[styles.totalVal, { color: c.text }]}>{formatPrice(totalPrice)}</Text>
                    </View>
                </View>

                {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.bg }]}>
                <Button title={`Place order • ${formatPrice(totalPrice)}`} onPress={placeOrder} loading={placing} />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { fontSize: 20, fontWeight: '700' },
    content: { padding: spacing.md },
    title: { fontSize: 22, fontWeight: '800', marginBottom: spacing.sm },
    sub: { fontSize: 14, marginBottom: spacing.xs },
    card: { borderWidth: 1, borderRadius: 14, padding: spacing.md, marginTop: spacing.md },
    line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
    lineTxt: { fontSize: 15 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: spacing.sm, marginTop: spacing.sm },
    totalLabel: { fontSize: 16, fontWeight: '700' },
    totalVal: { fontSize: 18, fontWeight: '800' },
    error: { fontSize: 14, marginTop: spacing.md, textAlign: 'center' },
    footer: { padding: spacing.md, borderTopWidth: 1 },
});
