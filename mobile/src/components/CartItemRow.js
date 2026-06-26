import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';
import { formatPrice } from '../utils/format';

/**
 * A single cart line (RN port of CartItemRow): name, unit price, quantity
 * stepper, line subtotal and remove. Delegates mutations to the cart context.
 */
const CartItemRow = ({ item }) => {
    const c = useThemeColors();
    const { setQuantity, removeItem } = useCart();

    return (
        <View style={[styles.row, { borderBottomColor: c.border }]}>
            <View style={styles.info}>
                <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.unit, { color: c.muted }]}>{formatPrice(item.price)} each</Text>
            </View>

            <View style={[styles.stepper, { borderColor: c.border }]}>
                <Pressable onPress={() => setQuantity(item.productId, item.quantity - 1)} style={styles.stepBtn} hitSlop={6}>
                    <Ionicons name="remove" size={18} color={c.brand} />
                </Pressable>
                <Text style={[styles.qty, { color: c.text }]}>{item.quantity}</Text>
                <Pressable onPress={() => setQuantity(item.productId, item.quantity + 1)} style={styles.stepBtn} hitSlop={6}>
                    <Ionicons name="add" size={18} color={c.brand} />
                </Pressable>
            </View>

            <Text style={[styles.subtotal, { color: c.text }]}>{formatPrice(item.price * item.quantity)}</Text>

            <Pressable onPress={() => removeItem(item.productId)} hitSlop={6} style={styles.remove}>
                <Ionicons name="close" size={18} color={c.muted} />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm + 2, borderBottomWidth: 1, gap: spacing.sm },
    info: { flex: 1 },
    name: { fontSize: 15, fontWeight: '600' },
    unit: { fontSize: 12, marginTop: 2 },
    stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 18, paddingHorizontal: 4 },
    stepBtn: { padding: 6 },
    qty: { fontSize: 14, fontWeight: '700', minWidth: 22, textAlign: 'center' },
    subtotal: { fontSize: 14, fontWeight: '700', minWidth: 62, textAlign: 'right' },
    remove: { padding: 2 },
});

export default CartItemRow;
