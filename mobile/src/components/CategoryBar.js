import React from 'react';
import { FlatList, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

// Emoji are presentational only; the category VALUES come from server data (Home).
const ICONS = {
    Pizza: '🍕', Sushi: '🍣', Burgers: '🍔', Healthy: '🥗', Mexican: '🌮', Asian: '🍜',
    Desserts: '🍰', Italian: '🍝', Coffee: '☕', Breakfast: '🍳', Indian: '🍛', Vegan: '🥬',
    Seafood: '🦐', Bakery: '🥐', Grill: '🍖', Thai: '🍲', Mediterranean: '🥙', Chinese: '🥡',
};
const iconFor = (c) => ICONS[c] || '🍽️';

/**
 * Horizontal category filter row (RN port of the web CategoryBar). Categories
 * are derived from server data; tapping filters, tapping the active one clears.
 */
const CategoryBar = ({ categories, selected, onSelect }) => {
    const c = useThemeColors();
    if (!categories || categories.length === 0) return null;

    return (
        <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
            renderItem={({ item }) => {
                const active = item === selected;
                return (
                    <Pressable
                        onPress={() => onSelect(active ? null : item)}
                        style={[
                            styles.tile,
                            { backgroundColor: active ? c.brand : c.surface, borderColor: active ? c.brand : c.border },
                        ]}
                    >
                        <Text style={styles.icon}>{iconFor(item)}</Text>
                        <Text style={[styles.label, { color: active ? '#fff' : c.text }]} numberOfLines={1}>{item}</Text>
                    </Pressable>
                );
            }}
        />
    );
};

const styles = StyleSheet.create({
    row: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingVertical: spacing.sm },
    tile: {
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm, borderRadius: 14, borderWidth: 1, minWidth: 80,
    },
    icon: { fontSize: 22, marginBottom: 2 },
    label: { fontSize: 12, fontWeight: '600' },
});

export default CategoryBar;
