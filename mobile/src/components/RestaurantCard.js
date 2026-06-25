import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';
import { radii, shadow } from '../theme/shadows';
import { formatDistance } from '../utils/geo';
import { getId } from '../utils/id';

// Deterministic fallback color for restaurants without an image (stable + varied).
const FALLBACKS = ['#ff9a9e', '#a18cd1', '#84fab0', '#f6a366', '#a1c4fd', '#f6d365', '#7ed6a5', '#c98cd1'];
const pickColor = (key = '') => {
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return FALLBACKS[hash % FALLBACKS.length];
};

/**
 * Wolt-style restaurant tile (RN port of the web RestaurantCard): image-forward
 * with a favorite heart, a rating pill, and an optional "X km away" chip when the
 * user has shared their location. Elevated card; tapping opens the menu.
 */
const RestaurantCard = ({ restaurant, distanceKm, width }) => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { name, rating, image, deliveryTime, priceRange } = restaurant;
    const isNew = !(Number(rating) > 0);
    const id = getId(restaurant);

    return (
        <Pressable
            onPress={() => navigation.navigate('Restaurant', { id })}
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: c.surface, borderColor: c.border, width, opacity: pressed ? 0.96 : 1 },
                shadow(2),
            ]}
        >
            <View style={[styles.media, { backgroundColor: image ? '#000' : pickColor(name) }]}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
                ) : (
                    <Text style={styles.initial}>{name ? name.charAt(0).toUpperCase() : '?'}</Text>
                )}
                <View style={styles.heart}>
                    <Ionicons name="heart-outline" size={16} color="#fff" />
                </View>
                {distanceKm != null && (
                    <View style={styles.distance}>
                        <Ionicons name="location-sharp" size={11} color="#fff" />
                        <Text style={styles.distanceTxt}>{formatDistance(distanceKm)}</Text>
                    </View>
                )}
            </View>

            <View style={styles.body}>
                <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>{name}</Text>
                <View style={styles.meta}>
                    <View style={[styles.ratingPill, { backgroundColor: isNew ? c.border : 'rgba(245,166,35,0.16)' }]}>
                        <Ionicons name="star" size={12} color={isNew ? c.muted : '#F5A623'} />
                        <Text style={[styles.ratingTxt, { color: isNew ? c.muted : c.text }]}>{isNew ? 'New' : rating}</Text>
                    </View>
                    {deliveryTime ? (
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={13} color={c.muted} />
                            <Text style={[styles.metaTxt, { color: c.muted }]}>{deliveryTime}</Text>
                        </View>
                    ) : null}
                    {priceRange ? <Text style={[styles.metaTxt, { color: c.muted }]}>{priceRange}</Text> : null}
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: { borderRadius: radii.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
    media: { height: 124, alignItems: 'center', justifyContent: 'center' },
    image: { width: '100%', height: '100%' },
    initial: { fontSize: 44, fontWeight: '800', color: 'rgba(255,255,255,0.92)' },
    heart: {
        position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
    },
    distance: {
        position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center',
        gap: 3, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill,
    },
    distanceTxt: { color: '#fff', fontSize: 11, fontWeight: '600' },
    body: { padding: spacing.sm + 2 },
    name: { fontSize: 15, fontWeight: '700', marginBottom: 5 },
    meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
    ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: radii.pill },
    ratingTxt: { fontSize: 12, fontWeight: '700' },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    metaTxt: { fontSize: 12, fontWeight: '500' },
});

export default RestaurantCard;
