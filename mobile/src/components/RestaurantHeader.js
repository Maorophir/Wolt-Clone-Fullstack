import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';
import { formatDistance } from '../utils/geo';
import { getId } from '../utils/id';

/**
 * Hero header at the top of a restaurant's menu (RN port of RestaurantHeader):
 * name, description, rating/New badge, address and optional distance. For the
 * restaurant's owner (or an admin) it also shows Edit / Manage menu actions.
 */
const RestaurantHeader = ({ restaurant, distanceKm }) => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { user } = useAuth();
    if (!restaurant) return null;

    const { name, description, address, rating, ownerId } = restaurant;
    const isNew = !(Number(rating) > 0);
    // Flattened list endpoint sends a string; /search sends a nested object.
    const addressText = typeof address === 'string' ? address : address?.name;
    const id = getId(restaurant);
    const isOwner = user && (String(ownerId) === String(user.id) || user.isAdmin);

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

            {isOwner && (
                <View style={styles.ownerActions}>
                    <Pressable
                        onPress={() => navigation.navigate('EditRestaurant', { id })}
                        style={[styles.ownerBtn, { borderColor: c.brand }]}
                    >
                        <Ionicons name="create-outline" size={16} color={c.brand} />
                        <Text style={[styles.ownerBtnTxt, { color: c.brand }]}>Edit</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => navigation.navigate('ManageMenu', { id })}
                        style={[styles.ownerBtn, { backgroundColor: c.brand, borderColor: c.brand }]}
                    >
                        <Ionicons name="restaurant-outline" size={16} color="#fff" />
                        <Text style={[styles.ownerBtnTxt, { color: '#fff' }]}>Manage menu</Text>
                    </Pressable>
                </View>
            )}
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
    ownerActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    ownerBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm, borderRadius: 20, borderWidth: 1.5,
    },
    ownerBtnTxt: { fontSize: 14, fontWeight: '700' },
});

export default RestaurantHeader;
