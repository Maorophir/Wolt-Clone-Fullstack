import React, { useCallback, useState } from 'react';
import {
    View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet, useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RestaurantCard from '../components/RestaurantCard';
import CategoryBar from '../components/CategoryBar';
import Carousel from '../components/Carousel';
import api from '../api/client';
import { useUserLocation } from '../context/LocationContext';
import { haversineKm } from '../utils/geo';
import { getId } from '../utils/id';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

// "20-30 min" -> 20, for sorting by speed; unknown -> Infinity (sorts last).
const parseMinutes = (dt) => {
    const m = parseInt(dt, 10);
    return Number.isFinite(m) ? m : Infinity;
};

/**
 * Home feed (RN port of pages/Home.js). Loads restaurants from the server, derives
 * categories + themed rows from that data, and shows each card's distance once a
 * delivery location is set (Haversine). Pull-to-refresh re-fetches.
 */
export default function Home() {
    const c = useThemeColors();
    const loc = useUserLocation();
    const { width } = useWindowDimensions();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [category, setCategory] = useState(null);

    const load = useCallback(async () => {
        setError('');
        try {
            const { data } = await api('/restaurants');
            setRestaurants(data || []);
        } catch (err) {
            setError(err.message || 'Failed to load restaurants.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const onRefresh = () => { setRefreshing(true); load(); };

    if (loading) {
        return <View style={[styles.center, { backgroundColor: c.bg }]}><ActivityIndicator size="large" color={c.brand} /></View>;
    }
    if (error) {
        return <View style={[styles.center, { backgroundColor: c.bg }]}><Text style={[styles.error, { color: c.danger }]}>{error}</Text></View>;
    }

    const categories = [...new Set(restaurants.map((r) => r.category).filter(Boolean))].sort();

    const withDistance = loc.coords
        ? restaurants.map((r) => ({
            ...r,
            distanceKm: r.latitude != null && r.longitude != null
                ? haversineKm(loc.coords, { lat: Number(r.latitude), lng: Number(r.longitude) })
                : undefined,
        }))
        : restaurants;

    const filtered = category ? withDistance.filter((r) => r.category === category) : withDistance;

    const popular = [...withDistance]
        .filter((r) => Number(r.rating) >= 4.5)
        .sort((a, b) => Number(b.rating) - Number(a.rating))
        .slice(0, 10);
    const fastest = [...withDistance]
        .filter((r) => r.deliveryTime)
        .sort((a, b) => parseMinutes(a.deliveryTime) - parseMinutes(b.deliveryTime))
        .slice(0, 10);

    const cardW = Math.min(260, width * 0.66);
    const renderRow = ({ item }) => <RestaurantCard restaurant={item} distanceKm={item.distanceKm} width={cardW} />;

    return (
        <ScrollView
            style={{ backgroundColor: c.bg }}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.brand} />}
        >
            <View style={styles.hero}>
                <Text style={[styles.heroTitle, { color: c.text }]}>Order food you love</Text>
                <Text style={[styles.heroSub, { color: c.muted }]}>Discover great restaurants near you.</Text>
            </View>

            <CategoryBar categories={categories} selected={category} onSelect={setCategory} />

            {!category && (
                <>
                    <Carousel title="Popular right now" data={popular} keyExtractor={(r) => getId(r)} renderItem={renderRow} />
                    <Carousel title="Fastest delivery" data={fastest} keyExtractor={(r) => getId(r)} renderItem={renderRow} />
                </>
            )}

            <View style={styles.grid}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>{category || 'All restaurants'}</Text>
                {filtered.length === 0 ? (
                    <Text style={[styles.empty, { color: c.muted }]}>No restaurants in this category.</Text>
                ) : (
                    filtered.map((r) => (
                        <View key={getId(r)} style={styles.gridItem}>
                            <RestaurantCard restaurant={r} distanceKm={r.distanceKm} />
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    error: { fontSize: 15, textAlign: 'center', paddingHorizontal: spacing.lg },
    hero: { paddingVertical: spacing.md, paddingHorizontal: spacing.md },
    heroTitle: { fontSize: 26, fontWeight: '900' },
    heroSub: { fontSize: 14, marginTop: 4 },
    grid: { paddingHorizontal: spacing.md },
    sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: spacing.sm, marginTop: spacing.xs },
    gridItem: { marginBottom: spacing.md },
    empty: { textAlign: 'center', padding: spacing.xl, fontSize: 15 },
});
