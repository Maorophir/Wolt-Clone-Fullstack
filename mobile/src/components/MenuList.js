import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MenuItemCard from './MenuItemCard';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';
import { getId } from '../utils/id';

/**
 * Renders a restaurant's menu grouped by category (RN port of MenuList). Only
 * shows available items; empty state when there are none. Plain Views (no
 * FlatList) because it lives inside the restaurant screen's ScrollView.
 */
const MenuList = ({ products, onAddToCart }) => {
    const c = useThemeColors();
    const visible = products ? products.filter((p) => p.isAvailable !== false) : [];

    if (visible.length === 0) {
        return <Text style={[styles.empty, { color: c.muted }]}>This restaurant has no menu items yet.</Text>;
    }

    const grouped = visible.reduce((acc, p) => {
        const cat = p.category || 'General';
        (acc[cat] = acc[cat] || []).push(p);
        return acc;
    }, {});

    return (
        <View style={styles.wrap}>
            {Object.keys(grouped).map((cat) => (
                <View key={cat} style={styles.section}>
                    <Text style={[styles.title, { color: c.text }]}>{cat}</Text>
                    {grouped[cat].map((p) => (
                        <MenuItemCard key={getId(p)} product={p} onAddToCart={onAddToCart} />
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
    section: { marginBottom: spacing.md },
    title: { fontSize: 18, fontWeight: '800', marginBottom: spacing.sm },
    empty: { textAlign: 'center', padding: spacing.xl, fontSize: 15 },
});

export default MenuList;
