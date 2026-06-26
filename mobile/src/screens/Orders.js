import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import { useRequireAuth } from '../hooks/useRequireAuth';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import { getId } from '../utils/id';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';
import { shadow } from '../theme/shadows';

const orderTotal = (items = []) =>
    items.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 0), 0);

const STATUS_COLORS = {
    pending: '#F5A623', preparing: '#00C2E8', on_the_way: '#3498DB',
    delivered: '#27AE60', cancelled: '#C0392B',
};

/**
 * Orders history (RN port of pages/OrdersPage.js). Protected — loads the
 * authenticated user's orders (JWT auto-attached) and lists them newest-first.
 */
export default function Orders() {
    const c = useThemeColors();
    const { isAuthenticated } = useRequireAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useFocusEffect(
        useCallback(() => {
            if (!isAuthenticated) { setLoading(false); return undefined; }
            let cancelled = false;
            (async () => {
                setLoading(true);
                setError('');
                try {
                    const { data } = await api('/orders');
                    if (!cancelled) setOrders(data || []);
                } catch (err) {
                    if (!cancelled) setError(err.message || 'Failed to load your orders.');
                } finally {
                    if (!cancelled) setLoading(false);
                }
            })();
            return () => { cancelled = true; };
        }, [isAuthenticated])
    );

    if (!isAuthenticated) {
        return <Screen style={styles.center}><Text style={{ color: c.muted }}>Please log in to view your orders.</Text></Screen>;
    }
    if (loading) {
        return <Screen style={styles.center}><ActivityIndicator size="large" color={c.brand} /></Screen>;
    }
    if (error) {
        return <Screen style={styles.center}><Text style={[styles.error, { color: c.danger }]}>{error}</Text></Screen>;
    }
    if (orders.length === 0) {
        return (
            <Screen style={styles.center}>
                <Ionicons name="receipt-outline" size={64} color={c.border} />
                <Text style={[styles.emptyTitle, { color: c.text }]}>No orders yet</Text>
                <Text style={[styles.emptySub, { color: c.muted }]}>Your past orders will show up here.</Text>
            </Screen>
        );
    }

    const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <Screen>
            <FlatList
                data={sorted}
                keyExtractor={(o) => getId(o)}
                contentContainerStyle={styles.list}
                renderItem={({ item: order }) => {
                    const color = STATUS_COLORS[order.status] || c.muted;
                    return (
                        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, shadow(1)]}>
                            <View style={styles.cardHead}>
                                <View style={[styles.status, { backgroundColor: `${color}22` }]}>
                                    <Text style={[styles.statusTxt, { color }]}>{order.status}</Text>
                                </View>
                                <Text style={[styles.date, { color: c.muted }]}>
                                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                                </Text>
                            </View>
                            {(order.items || []).map((it, idx) => (
                                <View key={idx} style={styles.line}>
                                    <Text style={[styles.lineTxt, { color: c.text }]}>{it.quantity} × {it.name}</Text>
                                    <Text style={[styles.lineTxt, { color: c.text }]}>
                                        {formatPrice((Number(it.price) || 0) * (it.quantity || 0))}
                                    </Text>
                                </View>
                            ))}
                            <View style={[styles.totalRow, { borderTopColor: c.border }]}>
                                <Text style={[styles.totalLabel, { color: c.text }]}>Total</Text>
                                <Text style={[styles.totalVal, { color: c.text }]}>
                                    {formatPrice(order.totalPrice ?? orderTotal(order.items))}
                                </Text>
                            </View>
                        </View>
                    );
                }}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg },
    emptyTitle: { fontSize: 20, fontWeight: '700' },
    emptySub: { fontSize: 14, textAlign: 'center' },
    error: { fontSize: 15, textAlign: 'center', paddingHorizontal: spacing.lg },
    list: { padding: spacing.md },
    card: { borderWidth: 1, borderRadius: 14, padding: spacing.md, marginBottom: spacing.md },
    cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    status: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
    statusTxt: { fontSize: 12, fontWeight: '800', textTransform: 'capitalize' },
    date: { fontSize: 12 },
    line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
    lineTxt: { fontSize: 14 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: spacing.sm, marginTop: spacing.sm },
    totalLabel: { fontSize: 15, fontWeight: '700' },
    totalVal: { fontSize: 16, fontWeight: '800' },
});
