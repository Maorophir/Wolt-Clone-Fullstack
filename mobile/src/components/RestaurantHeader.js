import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';
import { formatDistance } from '../utils/geo';

/**
 * Hero header at the top of a restaurant's menu (RN port of RestaurantHeader):
 * name, description, rating/New badge, address and optional distance. Purely
 * presentational — hides fields the server didn't return. (Owner edit/manage
 * actions live with the management screens — a later phase.)
 */
const RestaurantHeader = ({ restaurant, distanceKm }) => {
    const c = useThemeColors();
    if (!restaurant) return null;

    const { name, description, address, rating } = restaurant;
    const isNew = !(Number(rating) > 0);
    // Flattened list endpoint sends a string; /search sends a nested object.
    const addressText = typeof address === 'string' ? address : address?.name;

    return (
        <View style={styles.wrap}>
            <Text style={[styles.name, { color: c.text }]}>{name}</Text>
            {description ? <Text style={[styles.desc, { color: c.muted }]}>{description}</Text> : null}
            <View style={styles.meta}>
                <View style={[styles.rating, { backgroundColor: isNew ? c.border : 'rgba(245,166,35,0.15)' }]}>
                    <Ionicons name="star" size={14} color={isNew ? c.muted : '#F5A623'} />
                    <Text style={[styles.ratingTxt, { color: isNew ? c.muted : c.text }]}>{isNew ? 'New' : rating}</Text>
                </View>
                {addressText ? <Text style={[styles.addr, { color: c.muted }]}>{addressText}</Text> : null}
                {distanceKm != null && (
                    <View style={styles.dist}>
                        <Ionicons name="location-sharp" size={13} color={c.brand} />
                        <Text style={[styles.distTxt, { color: c.brand }]}>{formatDistance(distanceKm)} away</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
    name: { fontSize: 26, fontWeight: '800' },
    desc: { fontSize: 14, marginTop: 4, lineHeight: 20 },
    meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
    rating: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    ratingTxt: { fontSize: 13, fontWeight: '700' },
    addr: { fontSize: 13 },
    dist: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    distTxt: { fontSize: 13, fontWeight: '600' },
});

export default RestaurantHeader;
