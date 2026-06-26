import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Button from '../components/Button';
import CartItemRow from '../components/CartItemRow';
import { useCart } from '../context/CartContext';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';
import { formatPrice } from '../utils/format';

/**
 * Cart screen (RN port of pages/CartPage.js). Lists items, lets the user adjust
 * quantities or clear the cart, shows the total, and continues to checkout.
 * Browsing the cart is public; the auth gate lives on the checkout step.
 */
export default function Cart({ navigation }) {
    const c = useThemeColors();
    const { cart, totalItems, totalPrice, clearCart } = useCart();

    if (totalItems === 0) {
        return (
            <Screen style={styles.center}>
                <Ionicons name="cart-outline" size={64} color={c.border} />
                <Text style={[styles.emptyTitle, { color: c.text }]}>Your cart is empty</Text>
                <Pressable onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
                    <Text style={[styles.link, { color: c.brand }]}>Browse restaurants →</Text>
                </Pressable>
            </Screen>
        );
    }

    return (
        <Screen>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: c.text }]}>
                    Your order{cart.restaurantName ? ` from ${cart.restaurantName}` : ''}
                </Text>
                {cart.items.map((item) => <CartItemRow key={item.productId} item={item} />)}
                <View style={[styles.summary, { borderTopColor: c.border }]}>
                    <Text style={[styles.summaryLabel, { color: c.text }]}>Total</Text>
                    <Text style={[styles.summaryTotal, { color: c.text }]}>{formatPrice(totalPrice)}</Text>
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.bg }]}>
                <Button title="Clear cart" variant="outline" onPress={clearCart} style={styles.clearBtn} />
                <Button title="Checkout" onPress={() => navigation.navigate('Checkout')} style={styles.checkoutBtn} />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
    emptyTitle: { fontSize: 20, fontWeight: '700' },
    link: { fontSize: 15, fontWeight: '600' },
    content: { padding: spacing.md },
    title: { fontSize: 22, fontWeight: '800', marginBottom: spacing.sm },
    summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: spacing.md, marginTop: spacing.sm },
    summaryLabel: { fontSize: 16, fontWeight: '600' },
    summaryTotal: { fontSize: 20, fontWeight: '800' },
    footer: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderTopWidth: 1 },
    clearBtn: { flex: 1 },
    checkoutBtn: { flex: 2 },
});
