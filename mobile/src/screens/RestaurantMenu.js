import React, { useCallback, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RestaurantHeader from '../components/RestaurantHeader';
import MenuList from '../components/MenuList';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useUserLocation } from '../context/LocationContext';
import { haversineKm } from '../utils/geo';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

/**
 * Restaurant menu (RN port of pages/RestaurantMenu.js). Loads a restaurant + its
 * products, renders the hero/header/menu, and wires "add to cart" to the cart
 * context — using an Alert for the single-restaurant conflict (RN has no
 * synchronous confirm) and a brief toast for the success feedback.
 */
export default function RestaurantMenu({ route }) {
    const { id } = route.params;
    const c = useThemeColors();
    const { addItem, replaceCartWith } = useCart();
    const loc = useUserLocation();

    const [restaurant, setRestaurant] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const toastTimer = useRef(null);

    const showToast = (msg) => {
        setToast(msg);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(''), 1600);
    };

    useFocusEffect(
        useCallback(() => {
            let cancelled = false;
            (async () => {
                setLoading(true);
                setError('');
                try {
                    const [r, p] = await Promise.all([
                        api(`/restaurants/${id}`),
                        api(`/restaurants/${id}/products`),
                    ]);
                    if (!cancelled) {
                        setRestaurant(r.data);
                        setProducts(p.data || []);
                    }
                } catch (err) {
                    if (!cancelled) setError(err.message || 'Failed to load this restaurant.');
                } finally {
                    if (!cancelled) setLoading(false);
                }
            })();
            return () => {
                cancelled = true;
                if (toastTimer.current) clearTimeout(toastTimer.current);
            };
        }, [id])
    );

    const handleAdd = (product) => {
        const result = addItem(product, restaurant);
        if (result === 'conflict') {
            Alert.alert(
                'Start a new cart?',
                `Your cart has items from another restaurant. Start a new cart with ${restaurant?.name || 'this restaurant'}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'New cart',
                        style: 'destructive',
                        onPress: () => { replaceCartWith(product, restaurant); showToast(`${product.name} added to cart`); },
                    },
                ]
            );
            return;
        }
        showToast(`${product.name} added to cart`);
    };

    if (loading) {
        return <View style={[styles.center, { backgroundColor: c.bg }]}><ActivityIndicator size="large" color={c.brand} /></View>;
    }
    if (error) {
        return <View style={[styles.center, { backgroundColor: c.bg }]}><Text style={[styles.err, { color: c.danger }]}>{error}</Text></View>;
    }

    const distanceKm =
        loc.coords && restaurant.latitude != null && restaurant.longitude != null
            ? haversineKm(loc.coords, { lat: Number(restaurant.latitude), lng: Number(restaurant.longitude) })
            : undefined;

    return (
        <View style={[styles.flex, { backgroundColor: c.bg }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
                {restaurant?.image ? <Image source={{ uri: restaurant.image }} style={styles.hero} resizeMode="cover" /> : null}
                <RestaurantHeader restaurant={restaurant} distanceKm={distanceKm} />
                <MenuList products={products} onAddToCart={handleAdd} />
            </ScrollView>

            {toast ? (
                <View style={[styles.toast, { backgroundColor: c.text }]}>
                    <Text style={[styles.toastTxt, { color: c.bg }]}>{toast}</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    err: { fontSize: 15, textAlign: 'center', padding: spacing.lg },
    hero: { width: '100%', height: 200 },
    toast: {
        position: 'absolute', bottom: spacing.lg, alignSelf: 'center', paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm + 2, borderRadius: 24, maxWidth: '90%',
    },
    toastTxt: { fontSize: 14, fontWeight: '600' },
});
