import React, { useCallback, useState } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Button from '../components/Button';
import WoltInput from '../components/WoltInput';
import ImagePickerField from '../components/ImagePickerField';
import AddressBook from '../components/AddressBook';
import RestaurantCard from '../components/RestaurantCard';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useTheme } from '../theme/ThemeContext';
import { getId } from '../utils/id';
import { spacing } from '../theme/spacing';

/**
 * Profile (RN port of pages/Profile.js + the web navbar user menu). Edit display
 * name + avatar, manage the delivery address book, and — for business owners —
 * list/add/edit restaurants. Plus dark mode and logout. Protected.
 */
export default function Profile() {
    const { isDarkMode, toggleTheme, colors: c } = useTheme();
    const { isAuthenticated } = useRequireAuth();
    const { user, logout, updateUser } = useAuth();
    const navigation = useNavigation();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [image, setImage] = useState(user?.profileImage || null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null); // { text, ok }
    const [restaurants, setRestaurants] = useState([]);
    const [loadingRest, setLoadingRest] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (!user?.id || !user?.isBusinessOwner) return undefined;
            let cancelled = false;
            (async () => {
                setLoadingRest(true);
                try {
                    const { data } = await api(`/users/${user.id}/restaurants`);
                    if (!cancelled) setRestaurants(data || []);
                } catch {
                    /* ignore */
                } finally {
                    if (!cancelled) setLoadingRest(false);
                }
            })();
            return () => { cancelled = true; };
        }, [user?.id, user?.isBusinessOwner])
    );

    if (!isAuthenticated) {
        return <Screen style={styles.center}><Text style={{ color: c.muted }}>Please log in to view your profile.</Text></Screen>;
    }

    const saveProfile = async () => {
        if (!displayName.trim()) { setMsg({ text: 'Display name is required.', ok: false }); return; }
        setSaving(true);
        setMsg(null);
        try {
            const body = { displayName: displayName.trim() };
            if (image && image !== user?.profileImage) body.profileImage = image;
            const { data } = await api(`/users/${user.id}`, { method: 'PATCH', body });
            await updateUser({
                displayName: data?.displayName ?? displayName.trim(),
                profileImage: data?.profileImage ?? image,
            });
            setMsg({ text: 'Profile updated!', ok: true });
        } catch (err) {
            setMsg({ text: err.message || 'Failed to update profile.', ok: false });
        } finally {
            setSaving(false);
        }
    };

    const confirmLogout = () => {
        Alert.alert('Log out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log out', style: 'destructive', onPress: logout },
        ]);
    };

    return (
        <Screen scroll contentContainerStyle={styles.content}>
            {/* Personal details */}
            <Text style={[styles.sectionTitle, { color: c.text }]}>Personal details</Text>
            <ImagePickerField value={image} onChange={setImage} rounded height={110} />
            <WoltInput label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" editable={!saving} />
            <Text style={[styles.username, { color: c.muted }]}>
                @{user?.username}{user?.isBusinessOwner ? '  ·  Business owner' : ''}
            </Text>
            {msg ? <Text style={[styles.msg, { color: msg.ok ? c.brand : c.danger }]}>{msg.text}</Text> : null}
            <Button title="Save changes" onPress={saveProfile} loading={saving} style={{ marginTop: spacing.sm }} />

            {/* Delivery addresses */}
            <Text style={[styles.sectionTitle, { color: c.text, marginTop: spacing.xl }]}>Delivery addresses</Text>
            <Text style={[styles.sub, { color: c.muted }]}>The selected address is used to sort restaurants by distance.</Text>
            <AddressBook includeCurrentLocation />

            {/* My restaurants (business owner) */}
            {user?.isBusinessOwner && (
                <>
                    <Text style={[styles.sectionTitle, { color: c.text, marginTop: spacing.xl }]}>My restaurants</Text>
                    <Button title="+ Add restaurant" variant="outline" onPress={() => navigation.navigate('AddRestaurant')} style={{ marginBottom: spacing.md }} />
                    {loadingRest ? (
                        <Text style={{ color: c.muted }}>Loading…</Text>
                    ) : restaurants.length === 0 ? (
                        <Text style={[styles.sub, { color: c.muted }]}>You haven't added any restaurants yet.</Text>
                    ) : (
                        restaurants.map((r) => (
                            <View key={getId(r)} style={styles.restItem}>
                                <RestaurantCard restaurant={r} />
                                <Button
                                    title="Edit restaurant"
                                    variant="outline"
                                    onPress={() => navigation.navigate('EditRestaurant', { id: getId(r) })}
                                    style={styles.editBtn}
                                    textStyle={{ fontSize: 14 }}
                                />
                            </View>
                        ))
                    )}
                </>
            )}

            {/* Preferences */}
            <Text style={[styles.sectionTitle, { color: c.text, marginTop: spacing.xl }]}>Preferences</Text>
            <View style={[styles.prefRow, { borderColor: c.border }]}>
                <Ionicons name="moon-outline" size={20} color={c.text} />
                <Text style={[styles.prefLabel, { color: c.text }]}>Dark mode</Text>
                <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ true: c.brand }} />
            </View>

            <Button title="Log out" variant="danger" onPress={confirmLogout} style={{ marginTop: spacing.lg, marginBottom: spacing.xl }} />
        </Screen>
    );
}

const styles = StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center' },
    content: { padding: spacing.lg },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: spacing.sm },
    username: { fontSize: 13, marginBottom: spacing.xs },
    msg: { fontSize: 13, fontWeight: '600', marginBottom: spacing.xs },
    sub: { fontSize: 13, marginBottom: spacing.md },
    restItem: { marginBottom: spacing.md },
    editBtn: { marginTop: spacing.xs, minHeight: 40 },
    prefRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: 12, padding: spacing.md },
    prefLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
});
