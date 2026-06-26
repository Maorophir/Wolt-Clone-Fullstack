import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

/**
 * A titled horizontal row (RN port of the web Carousel). Takes `data` +
 * `renderItem` and renders a horizontal FlatList — the idiomatic RN replacement
 * for the web's scroll-snap track.
 */
const Carousel = ({ title, data, renderItem, keyExtractor }) => {
    const c = useThemeColors();
    if (!data || data.length === 0) return null;

    return (
        <View style={styles.wrap}>
            {title ? <Text style={[styles.title, { color: c.text }]}>{title}</Text> : null}
            <FlatList
                horizontal
                data={data}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.row}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: { marginBottom: spacing.lg },
    title: { fontSize: 20, fontWeight: '800', marginBottom: spacing.sm, paddingHorizontal: spacing.md },
    row: { paddingHorizontal: spacing.md, gap: spacing.md },
});

export default Carousel;
