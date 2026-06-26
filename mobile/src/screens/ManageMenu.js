import React, { useCallback, useState } from 'react';
import {
    View, Text, Image, Switch, Pressable, ActivityIndicator,
    KeyboardAvoidingView, Platform, Alert, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import WoltInput from '../components/WoltInput';
import Button from '../components/Button';
import ImagePickerField from '../components/ImagePickerField';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { getId } from '../utils/id';
import { formatPrice } from '../utils/format';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

const emptyForm = { name: '', description: '', price: '', category: 'General', isAvailable: true, image: '' };

/**
 * ManageMenu (RN port of pages/ManageMenu.js). Owner-only product CRUD for one
 * restaurant: an add/edit form on top, the current menu below with edit/delete.
 */
export default function ManageMenu({ route }) {
    const { id } = route.params;
    const c = useThemeColors();
    const { isAuthenticated } = useRequireAuth();
    const { user } = useAuth();

    const [restaurant, setRestaurant] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(true);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [image, setImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState(null); // { text, ok }

    const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

    const loadProducts = useCallback(async () => {
        const { data } = await api(`/restaurants/${id}/products`);
        setProducts(data || []);
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            let cancelled = false;
            (async () => {
                setLoading(true);
                try {
                    const { data: r } = await api(`/restaurants/${id}`);
                    if (cancelled) return;
                    const owns = user && (String(r.ownerId) === String(user.id) || user.isAdmin);
                    setAllowed(Boolean(owns));
                    setRestaurant(r);
                    if (owns) await loadProducts();
                } catch {
                    if (!cancelled) setAllowed(false);
                } finally {
                    if (!cancelled) setLoading(false);
                }
            })();
            return () => { cancelled = true; };
        }, [id, user?.id, loadProducts])
    );

    const resetForm = () => { setEditingId(null); setForm(emptyForm); setImage(null); };

    const startEdit = (p) => {
        setEditingId(getId(p));
        setForm({
            name: p.name,
            description: p.description || '',
            price: String(p.price),
            category: p.category || 'General',
            isAvailable: p.isAvailable !== false,
            image: p.image || '',
        });
        setImage(p.image || null);
        setMsg(null);
    };

    const onDelete = (pid) => {
        Alert.alert('Delete dish', 'Are you sure you want to delete this dish?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api(`/restaurants/${id}/products/${pid}`, { method: 'DELETE' });
                        if (editingId === pid) resetForm();
                        setMsg({ text: 'Dish deleted.', ok: true });
                        await loadProducts();
                    } catch (err) {
                        setMsg({ text: err.message || 'Failed to delete dish.', ok: false });
                    }
                },
            },
        ]);
    };

    const submit = async () => {
        if (!form.name.trim()) { setMsg({ text: 'Dish name is required.', ok: false }); return; }
        const price = parseFloat(form.price);
        if (!Number.isFinite(price) || price < 0) { setMsg({ text: 'Enter a valid price.', ok: false }); return; }
        setSubmitting(true);
        setMsg(null);
        try {
            const body = {
                name: form.name.trim(),
                description: form.description.trim(),
                price,
                category: form.category.trim() || 'General',
                isAvailable: form.isAvailable,
                image: image || undefined,
            };
            if (editingId) await api(`/restaurants/${id}/products/${editingId}`, { method: 'PATCH', body });
            else await api(`/restaurants/${id}/products`, { method: 'POST', body });
            setMsg({ text: editingId ? 'Dish updated!' : 'Dish added!', ok: true });
            resetForm();
            await loadProducts();
        } catch (err) {
            setMsg({ text: err.message || 'Failed to save dish.', ok: false });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Screen style={styles.center}><ActivityIndicator size="large" color={c.brand} /></Screen>;
    }
    if (!isAuthenticated || !allowed) {
        return <Screen style={styles.center}><Text style={[styles.msg, { color: c.muted }]}>You don't have permission to manage this menu.</Text></Screen>;
    }

    return (
        <Screen scroll contentContainerStyle={styles.content}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <Text style={[styles.title, { color: c.text }]}>{restaurant?.name}</Text>
                <Text style={[styles.section, { color: c.text }]}>{editingId ? 'Edit dish' : 'Add new dish'}</Text>
                {msg ? <Text style={[styles.msg2, { color: msg.ok ? c.brand : c.danger }]}>{msg.text}</Text> : null}

                <ImagePickerField label="Dish image (optional)" value={image} onChange={setImage} height={130} />
                <WoltInput label="Dish name *" value={form.name} onChangeText={set('name')} editable={!submitting} />
                <WoltInput label="Price *" value={String(form.price)} onChangeText={set('price')} keyboardType="decimal-pad" placeholder="0.00" editable={!submitting} />
                <WoltInput label="Category *" value={form.category} onChangeText={set('category')} placeholder="e.g. Starters, Mains, Drinks" editable={!submitting} />
                <WoltInput label="Description" value={form.description} onChangeText={set('description')} multiline editable={!submitting} style={styles.textarea} />

                <View style={[styles.availRow, { borderColor: c.border }]}>
                    <Text style={[styles.availLabel, { color: c.text }]}>Available for order</Text>
                    <Switch value={form.isAvailable} onValueChange={set('isAvailable')} trackColor={{ true: c.brand }} />
                </View>

                <View style={styles.formActions}>
                    {editingId ? <Button title="Cancel edit" variant="outline" onPress={resetForm} style={{ flex: 1 }} /> : null}
                    <Button title={editingId ? 'Save changes' : 'Add dish'} onPress={submit} loading={submitting} style={{ flex: 1 }} />
                </View>

                <Text style={[styles.section, { color: c.text, marginTop: spacing.xl }]}>Current menu ({products.length})</Text>
                {products.length === 0 ? (
                    <Text style={[styles.msg, { color: c.muted }]}>No dishes added yet.</Text>
                ) : (
                    products.map((p) => (
                        <View key={getId(p)} style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                            {p.image ? <Image source={{ uri: p.image }} style={styles.cardImg} /> : null}
                            <View style={styles.cardInfo}>
                                <Text style={[styles.cardName, { color: c.text }]} numberOfLines={1}>
                                    {p.name}{p.isAvailable === false ? '  (unavailable)' : ''}
                                </Text>
                                <Text style={[styles.cardMeta, { color: c.muted }]}>{formatPrice(p.price)} · {p.category || 'General'}</Text>
                            </View>
                            <Pressable onPress={() => startEdit(p)} hitSlop={6} style={styles.cardBtn}>
                                <Ionicons name="pencil" size={18} color={c.brand} />
                            </Pressable>
                            <Pressable onPress={() => onDelete(getId(p))} hitSlop={6} style={styles.cardBtn}>
                                <Ionicons name="trash-outline" size={18} color={c.danger} />
                            </Pressable>
                        </View>
                    ))
                )}
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center' },
    msg: { fontSize: 15, textAlign: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    content: { padding: spacing.lg },
    title: { fontSize: 22, fontWeight: '800', marginBottom: spacing.sm },
    section: { fontSize: 17, fontWeight: '800', marginBottom: spacing.sm },
    msg2: { fontSize: 13, fontWeight: '600', marginBottom: spacing.sm },
    textarea: { height: 80, textAlignVertical: 'top', paddingTop: spacing.sm },
    availRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md },
    availLabel: { fontSize: 15, fontWeight: '600' },
    formActions: { flexDirection: 'row', gap: spacing.sm },
    card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: 12, padding: spacing.sm + 2, marginBottom: spacing.sm },
    cardImg: { width: 48, height: 48, borderRadius: 8 },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontWeight: '700' },
    cardMeta: { fontSize: 13, marginTop: 2 },
    cardBtn: { padding: 6 },
});
