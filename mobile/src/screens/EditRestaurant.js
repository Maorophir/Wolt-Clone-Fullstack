import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import WoltInput from '../components/WoltInput';
import Button from '../components/Button';
import ImagePickerField from '../components/ImagePickerField';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { getCurrentPosition } from '../utils/geo';
import { getId } from '../utils/id';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

/**
 * EditRestaurant (RN port of pages/EditRestaurant.js). Owner-only edit + delete.
 * The server's PATCH doesn't re-parse the address, so we send `address` already
 * shaped as the schema sub-document { name, latitude, longitude }.
 */
export default function EditRestaurant({ route, navigation }) {
    const { id } = route.params;
    const c = useThemeColors();
    const { isAuthenticated } = useRequireAuth();
    const { user } = useAuth();

    const [form, setForm] = useState({ name: '', description: '', address: '', category: '', latitude: '', longitude: '' });
    const [image, setImage] = useState(null);
    const [cats, setCats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(true);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [locating, setLocating] = useState(false);

    const set = (k) => (v) => {
        setForm((p) => ({ ...p, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
    };

    useFocusEffect(
        useCallback(() => {
            let cancelled = false;
            (async () => {
                setLoading(true);
                try {
                    const [{ data: r }, { data: list }] = await Promise.all([
                        api(`/restaurants/${id}`),
                        api('/restaurants'),
                    ]);
                    if (cancelled) return;
                    const owns = user && (String(r.ownerId) === String(user.id) || user.isAdmin);
                    setAllowed(Boolean(owns));
                    setCats([...new Set((list || []).map((x) => x.category).filter(Boolean))].sort());
                    setForm({
                        name: r.name || '',
                        description: r.description || '',
                        address: typeof r.address === 'string' ? r.address : (r.address?.name || ''),
                        category: r.category || '',
                        latitude: r.latitude != null ? String(r.latitude) : '',
                        longitude: r.longitude != null ? String(r.longitude) : '',
                    });
                    setImage(r.image || null);
                } catch {
                    if (!cancelled) setAllowed(false);
                } finally {
                    if (!cancelled) setLoading(false);
                }
            })();
            return () => { cancelled = true; };
        }, [id, user?.id])
    );

    const useMyLocation = async () => {
        setLocating(true);
        setErrors((e) => ({ ...e, location: '' }));
        try {
            const { lat, lng } = await getCurrentPosition();
            setForm((p) => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
        } catch (err) {
            setErrors((e) => ({ ...e, location: err && err.code === 1 ? 'Location was blocked — enter coordinates manually.' : 'Could not get your location.' }));
        } finally {
            setLocating(false);
        }
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Restaurant name is required.';
        if (!form.category.trim()) e.category = 'Category is required.';
        if (!form.address.trim()) e.address = 'Address is required.';
        const hasLat = String(form.latitude).trim() !== '';
        const hasLng = String(form.longitude).trim() !== '';
        if (hasLat !== hasLng) {
            e.location = 'Provide both latitude and longitude, or leave both empty.';
        } else if (hasLat) {
            const la = Number(form.latitude);
            const lo = Number(form.longitude);
            if (!Number.isFinite(la) || la < -90 || la > 90 || !Number.isFinite(lo) || lo < -180 || lo > 180) {
                e.location = 'Latitude must be -90..90 and longitude -180..180.';
            }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        setErrors((e) => ({ ...e, submit: '' }));
        try {
            const hasCoords = String(form.latitude).trim() !== '' && String(form.longitude).trim() !== '';
            const address = hasCoords
                ? { name: form.address.trim(), latitude: Number(form.latitude), longitude: Number(form.longitude) }
                : { name: form.address.trim() };
            await api(`/restaurants/${id}`, {
                method: 'PATCH',
                body: {
                    name: form.name.trim(),
                    description: form.description.trim(),
                    category: form.category.trim(),
                    image: image || undefined,
                    address,
                },
            });
            Alert.alert('Saved', 'Restaurant updated successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (err) {
            setErrors((e) => ({ ...e, submit: err.message || 'Failed to update restaurant.' }));
        } finally {
            setSubmitting(false);
        }
    };

    const onDelete = () => {
        Alert.alert('Delete restaurant', 'This permanently deletes the restaurant. Continue?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api(`/restaurants/${id}`, { method: 'DELETE' });
                        navigation.navigate('MainTabs', { screen: 'Profile' });
                    } catch (err) {
                        Alert.alert('Error', err.message || 'Failed to delete restaurant.');
                    }
                },
            },
        ]);
    };

    if (loading) {
        return <Screen style={styles.center}><ActivityIndicator size="large" color={c.brand} /></Screen>;
    }
    if (!isAuthenticated || !allowed) {
        return <Screen style={styles.center}><Text style={[styles.msg, { color: c.muted }]}>You don't have permission to edit this restaurant.</Text></Screen>;
    }

    return (
        <Screen scroll contentContainerStyle={styles.content}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {errors.submit ? <Text style={[styles.banner, { backgroundColor: 'rgba(192,57,43,0.12)', color: c.danger }]}>{errors.submit}</Text> : null}

                <ImagePickerField label="Cover image" value={image} onChange={setImage} height={150} />
                <WoltInput label="Restaurant name *" value={form.name} onChangeText={set('name')} error={errors.name} editable={!submitting} />

                <Text style={[styles.label, { color: c.text }]}>Category *</Text>
                {cats.length > 0 && (
                    <View style={styles.chips}>
                        {cats.map((cat) => {
                            const active = form.category === cat;
                            return (
                                <Pressable key={cat} onPress={() => set('category')(cat)} style={[styles.chip, { borderColor: active ? c.brand : c.border, backgroundColor: active ? c.brand : 'transparent' }]}>
                                    <Text style={{ color: active ? '#fff' : c.text, fontSize: 13, fontWeight: '600' }}>{cat}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                )}
                <WoltInput value={form.category} onChangeText={set('category')} placeholder="Type or pick a category" error={errors.category} editable={!submitting} />

                <WoltInput label="Address *" value={form.address} onChangeText={set('address')} error={errors.address} editable={!submitting} />

                <Button title="Use my current location" variant="outline" onPress={useMyLocation} loading={locating} />
                <View style={styles.coordRow}>
                    <View style={styles.coordCol}><WoltInput label="Latitude" value={String(form.latitude)} onChangeText={set('latitude')} keyboardType="numbers-and-punctuation" editable={!submitting} /></View>
                    <View style={styles.coordCol}><WoltInput label="Longitude" value={String(form.longitude)} onChangeText={set('longitude')} keyboardType="numbers-and-punctuation" editable={!submitting} /></View>
                </View>
                {errors.location ? <Text style={[styles.err, { color: c.danger }]}>{errors.location}</Text> : null}

                <WoltInput label="Description" value={form.description} onChangeText={set('description')} multiline editable={!submitting} style={styles.textarea} />

                <Button title="Save changes" onPress={submit} loading={submitting} style={{ marginTop: spacing.sm }} />
                <Button title="Manage menu" variant="outline" onPress={() => navigation.navigate('ManageMenu', { id })} style={{ marginTop: spacing.sm }} />
                <Button title="Delete restaurant" variant="danger" onPress={onDelete} style={{ marginTop: spacing.sm, marginBottom: spacing.xl }} />
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center' },
    msg: { fontSize: 15, textAlign: 'center', paddingHorizontal: spacing.lg },
    content: { padding: spacing.lg },
    banner: { padding: spacing.md, borderRadius: 10, marginBottom: spacing.md, textAlign: 'center', fontWeight: '600' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.xs },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
    chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 18, borderWidth: 1 },
    coordRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    coordCol: { flex: 1 },
    err: { fontSize: 13, marginBottom: spacing.sm },
    textarea: { height: 90, textAlignVertical: 'top', paddingTop: spacing.sm },
});
