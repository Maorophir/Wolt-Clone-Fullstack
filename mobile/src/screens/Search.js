import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import SearchBar from '../components/SearchBar';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import { getId } from '../utils/id';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

/**
 * Search (RN port of pages/SearchResults.js + the navbar SearchBar). Queries
 * GET /search/:query, which returns a mix of { type: 'restaurant' | 'product' }.
 * Tapping a result opens the relevant restaurant menu.
 */
export default function Search() {
    const c = useThemeColors();
    const navigation = useNavigation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');

    const onSubmit = async () => {
        const q = query.trim();
        if (!q) return;
        setLoading(true);
        setError('');
        setSearched(true);
        try {
            const { data } = await api(`/search/${encodeURIComponent(q)}`);
            setResults(data || []);
        } catch (err) {
            setError(err.message || 'Search failed.');
        } finally {
            setLoading(false);
        }
    };

    const openItem = (item) => {
        if (item.type === 'restaurant') navigation.navigate('Restaurant', { id: getId(item) });
        else if (item.type === 'product' && item.restaurantId) navigation.navigate('Restaurant', { id: item.restaurantId });
    };

    return (
        <Screen>
            <SearchBar value={query} onChangeText={setQuery} onSubmit={onSubmit} />
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={c.brand} /></View>
            ) : error ? (
                <Text style={[styles.msg, { color: c.danger }]}>{error}</Text>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item, idx) => `${item.type}-${getId(item) || idx}`}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Ionicons name={searched ? 'sad-outline' : 'search'} size={56} color={c.border} />
                            <Text style={[styles.msg, { color: c.muted }]}>
                                {searched ? 'No results found.' : 'Search for restaurants or dishes.'}
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <Pressable onPress={() => openItem(item)} style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
                            <Ionicons name={item.type === 'restaurant' ? 'restaurant' : 'fast-food'} size={20} color={c.brand} />
                            <View style={styles.rowInfo}>
                                <Text style={[styles.rowName, { color: c.text }]} numberOfLines={1}>{item.name}</Text>
                                <Text style={[styles.rowType, { color: c.muted }]}>
                                    {item.type === 'restaurant'
                                        ? (item.category || 'Restaurant')
                                        : `Dish${item.price != null ? ` · ${formatPrice(item.price)}` : ''}`}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={c.muted} />
                        </Pressable>
                    )}
                />
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyWrap: { alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.sm },
    msg: { textAlign: 'center', paddingHorizontal: spacing.xl, fontSize: 15 },
    list: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
    rowInfo: { flex: 1 },
    rowName: { fontSize: 15, fontWeight: '700' },
    rowType: { fontSize: 13, marginTop: 2 },
});
