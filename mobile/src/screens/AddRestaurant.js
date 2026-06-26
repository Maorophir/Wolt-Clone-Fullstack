import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import WoltInput from '../components/WoltInput';
import Button from '../components/Button';
import ImagePickerField from '../components/ImagePickerField';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { getCurrentPosition } from '../utils/geo';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

/**
 * AddRestaurant (RN port of pages/AddRestaurant.js). Business-owner only. Creates
 * a restaurant via POST /restaurants (the server parses address + coords into its
 * address sub-document). Category chips are derived from existing data.
 */
export default function AddRestaurant({ navigation }) {
    const c = useThemeColors();
    const { isAuthenticated } = useRequireAuth();
    const { user } = useAuth();

    const [form, setForm] = useState({ name: '', description: '', address: '', category: '', latitude: '', longitude: '' });
    const [image, setImage] = useState(null);
    const [cats, setCats] = useState([]);
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
                try {
                    const { data } = await api('/restaurants');
                    if (!cancelled) setCats([...new Set((data || []).map((r) => r.category).filter(Boolean))].sort());
                } catch {
                    /* non-fatal — owner can still type a category */
                }
            })();
            return () => { cancelled = true; };
        }, [])
    );

    if (!isAuthenticated) {
        return <Screen style={styles.center}><Text style={{ color: c.muted }}>Please log in…</Text></Screen>;
    }
    if (!user?.isBusinessOwner) {
        return <Screen style={styles.center}><Text style={[styles.msg, { color: c.muted }]}>Only business owners can add restaurants.</Text></Screen>;
    }

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
            await api('/restaurants', {
                method: 'POST',
                body: {
                    name: form.name.trim(),
                    description: form.description.trim(),
                    address: form.address.trim(),
                    category: form.category.trim(),
                    rating: 0,
                    image: image || undefined,
                    latitude: form.latitude !== '' ? Number(form.latitude) : undefined,
                    longitude: form.longitude !== '' ? Number(form.longitude) : undefined,
                },
            });
            Alert.alert('Created', 'Restaurant created successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (err) {
            setErrors((e) => ({ ...e, submit: err.message || 'Failed to create restaurant.' }));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Screen scroll contentContainerStyle={styles.content}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {errors.submit ? <Text style={[styles.banner, { backgroundColor: 'rgba(192,57,43,0.12)', color: c.danger }]}>{errors.submit}</Text> : null}

                <ImagePickerField label="Cover image (optional)" value={image} onChange={setImage} height={150} />
                <WoltInput label="Restaurant name *" value={form.name} onChangeText={set('name')} placeholder="e.g., The Golden Fork" error={errors.name} editable={!submitting} />

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

                <WoltInput label="Address *" value={form.address} onChangeText={set('address')} placeholder="e.g., 123 Main St, Tel Aviv" error={errors.address} editable={!submitting} />

                <Button title="Use my current location" variant="outline" onPress={useMyLocation} loading={locating} />
                <View style={styles.coordRow}>
                    <View style={styles.coordCol}><WoltInput label="Latitude" value={String(form.latitude)} onChangeText={set('latitude')} placeholder="32.07" keyboardType="numbers-and-punctuation" editable={!submitting} /></View>
                    <View style={styles.coordCol}><WoltInput label="Longitude" value={String(form.longitude)} onChangeText={set('longitude')} placeholder="34.78" keyboardType="numbers-and-punctuation" editable={!submitting} /></View>
                </View>
                {errors.location ? <Text style={[styles.err, { color: c.danger }]}>{errors.location}</Text> : null}

                <WoltInput label="Description (optional)" value={form.description} onChangeText={set('description')} placeholder="Cuisine, atmosphere, specialities…" multiline editable={!submitting} style={styles.textarea} />

                <Button title="Create restaurant" onPress={submit} loading={submitting} style={styles.submit} />
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
    submit: { marginTop: spacing.sm, marginBottom: spacing.xl },
});
