import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';
import { formatPrice } from '../utils/format';

/**
 * A single menu item (RN port of MenuItemCard): name, description, price, image
 * and an add button. Presentational — `onAddToCart(product)` comes from the page.
 */
const MenuItemCard = ({ product, onAddToCart }) => {
    const c = useThemeColors();
    const { name, description, price, isAvailable, image } = product;
    const available = isAvailable !== false;

    return (
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border, opacity: available ? 1 : 0.55 }]}>
            <View style={styles.info}>
                <Text style={[styles.name, { color: c.text }]}>{name}</Text>
                {description ? (
                    <Text style={[styles.desc, { color: c.muted }]} numberOfLines={2}>{description}</Text>
                ) : null}
                <Text style={[styles.price, { color: c.text }]}>{formatPrice(price)}</Text>
            </View>

            <View style={styles.media}>
                {image ? <Image source={{ uri: image }} style={styles.image} resizeMode="cover" /> : null}
                <Pressable
                    onPress={() => available && onAddToCart(product)}
                    disabled={!available}
                    style={[styles.add, { backgroundColor: c.brand }]}
                    accessibilityLabel={available ? `Add ${name} to cart` : 'Unavailable'}
                >
                    <Ionicons name="add" size={22} color="#fff" />
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: spacing.sm + 2,
        marginBottom: spacing.sm, gap: spacing.sm,
    },
    info: { flex: 1, justifyContent: 'center' },
    name: { fontSize: 16, fontWeight: '700' },
    desc: { fontSize: 13, marginTop: 2, lineHeight: 18 },
    price: { fontSize: 15, fontWeight: '700', marginTop: 6 },
    media: { width: 92, height: 92, alignItems: 'flex-end', justifyContent: 'flex-end' },
    image: { position: 'absolute', top: 0, left: 0, width: 92, height: 92, borderRadius: 10 },
    add: {
        width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
    },
});

export default MenuItemCard;
