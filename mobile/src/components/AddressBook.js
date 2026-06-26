import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WoltInput from './WoltInput';
import Button from './Button';
import { useUserLocation } from '../context/LocationContext';
import { getCurrentPosition } from '../utils/geo';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

const LABELS = ['Home', 'Work', 'Other'];
const iconForLabel = (label = '') => {
    const l = label.toLowerCase();
    if (l.includes('home')) return 'home-outline';
    if (l.includes('work')) return 'briefcase-outline';
    return 'location-outline';
};
const emptyForm = { label: 'Home', address: '', latitude: '', longitude: '' };

/**
 * Reusable saved-address book (RN port of components/AddressBook.js): lists saved
 * addresses (select / edit / delete), an optional "use my current location" row,
 * and an inline add/edit form. Backed by LocationContext. Used by Profile and the
 * header "Where to?" sheet.
 */
const AddressBook = ({ onPick, includeCurrentLocation = false }) => {
    const c = useThemeColors();
    const loc = useUserLocation();
    const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit'
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [locating, setLocating] = useState(false);

    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

    const isActive = (a) =>
        loc.active &&
        Number(loc.active.lat) === Number(a.latitude) &&
        Number(loc.active.lng) === Number(a.longitude);

    const startAdd = () => { setForm(emptyForm); setFormError(''); setMode('add'); };
    const startEdit = (a) => {
        setForm({ label: a.label || 'Other', address: a.address || '', latitude: String(a.latitude), longitude: String(a.longitude) });
        setEditId(a.id);
        setFormError('');
        setMode('edit');
    };
    const backToList = () => { setMode('list'); setForm(emptyForm); setEditId(null); setFormError(''); };

    const fillFromGeo = async () => {
        setLocating(true);
        setFormError('');
        try {
            const cc = await getCurrentPosition();
            setForm((f) => ({ ...f, latitude: cc.lat.toFixed(6), longitude: cc.lng.toFixed(6) }));
        } catch (err) {
            setFormError(err && err.code === 1
                ? 'Location was blocked — enter coordinates manually.'
                : 'Could not get your location — enter coordinates manually.');
        } finally {
            setLocating(false);
        }
    };

    const save = () => {
        const lat = Number(form.latitude);
        const lng = Number(form.longitude);
        if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
            setFormError('Enter valid coordinates (latitude -90..90, longitude -180..180).');
            return;
        }
        const payload = { label: form.label.trim() || 'Other', address: form.address.trim(), latitude: lat, longitude: lng };
        if (mode === 'add') {
            const added = loc.addAddress(payload);
            loc.selectAddress(added);
            backToList();
            if (onPick) onPick();
        } else {
            loc.updateAddress(editId, payload);
            backToList();
        }
    };

    if (mode !== 'list') {
        return (
            <View>
                <Text style={[styles.label, { color: c.text }]}>Label</Text>
                <View style={styles.chips}>
                    {LABELS.map((l) => {
                        const active = form.label === l;
                        return (
                            <Pressable
                                key={l}
                                onPress={() => set('label')(l)}
                                style={[styles.chip, { borderColor: active ? c.brand : c.border, backgroundColor: active ? c.brand : 'transparent' }]}
                            >
                                <Text style={{ color: active ? '#fff' : c.text, fontWeight: '600' }}>{l}</Text>
                            </Pressable>
                        );
                    })}
                </View>
                <WoltInput label="Address" value={form.address} onChangeText={set('address')} placeholder="e.g., Dizengoff 50" />
                <Button title="Use my current location" variant="outline" onPress={fillFromGeo} loading={locating} style={{ marginBottom: spacing.md }} />
                <View style={styles.coordRow}>
                    <View style={styles.coordCol}>
                        <WoltInput label="Latitude" value={String(form.latitude)} onChangeText={set('latitude')} placeholder="32.07" keyboardType="numbers-and-punctuation" />
                    </View>
                    <View style={styles.coordCol}>
                        <WoltInput label="Longitude" value={String(form.longitude)} onChangeText={set('longitude')} placeholder="34.78" keyboardType="numbers-and-punctuation" />
                    </View>
                </View>
                {formError ? <Text style={[styles.err, { color: c.danger }]}>{formError}</Text> : null}
                <View style={styles.formActions}>
                    <Button title="Back" variant="outline" onPress={backToList} style={{ flex: 1 }} />
                    <Button title={mode === 'add' ? 'Add address' : 'Save'} onPress={save} style={{ flex: 1 }} />
                </View>
            </View>
        );
    }

    return (
        <View>
            {includeCurrentLocation && (
                <Pressable
                    onPress={async () => { const r = await loc.useCurrentLocation(); if (r && onPick) onPick(); }}
                    style={[styles.row, { borderColor: c.border }]}
                >
                    <Ionicons name="navigate" size={20} color={c.brand} />
                    <View style={styles.rowBody}>
                        <Text style={[styles.rowTitle, { color: c.text }]}>Use my current location</Text>
                        <Text style={[styles.rowSub, { color: c.muted }]}>
                            {loc.status === 'loading' ? 'Locating…'
                                : loc.status === 'denied' ? 'Location is blocked'
                                : loc.status === 'unavailable' ? 'Location unavailable'
                                : 'Find restaurants near you'}
                        </Text>
                    </View>
                    {loc.active && loc.active.label === 'Current location'
                        ? <Ionicons name="checkmark-circle" size={20} color={c.brand} /> : null}
                </Pressable>
            )}

            {loc.addresses.length === 0 ? (
                <Text style={[styles.empty, { color: c.muted }]}>No saved addresses yet — add one below.</Text>
            ) : null}

            {loc.addresses.map((a) => (
                <View key={a.id} style={[styles.row, { borderColor: c.border }]}>
                    <Ionicons name={iconForLabel(a.label)} size={20} color={isActive(a) ? c.brand : c.muted} />
                    <Pressable style={styles.rowBody} onPress={() => { loc.selectAddress(a); if (onPick) onPick(); }}>
                        <Text style={[styles.rowTitle, { color: c.text }]}>
                            {a.label}{isActive(a) ? '  ✓' : ''}
                        </Text>
                        {a.address ? <Text style={[styles.rowSub, { color: c.muted }]} numberOfLines={1}>{a.address}</Text> : null}
                    </Pressable>
                    <Pressable onPress={() => startEdit(a)} hitSlop={6} style={styles.iconBtn}>
                        <Ionicons name="pencil" size={18} color={c.brand} />
                    </Pressable>
                    <Pressable onPress={() => loc.removeAddress(a.id)} hitSlop={6} style={styles.iconBtn}>
                        <Ionicons name="trash-outline" size={18} color={c.danger} />
                    </Pressable>
                </View>
            ))}

            <Pressable onPress={startAdd} style={[styles.row, styles.addRow, { borderColor: c.brand }]}>
                <Ionicons name="add-circle-outline" size={20} color={c.brand} />
                <Text style={[styles.rowTitle, { color: c.brand }]}>Add new address</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.xs },
    chips: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, borderWidth: 1 },
    coordRow: { flexDirection: 'row', gap: spacing.sm },
    coordCol: { flex: 1 },
    err: { fontSize: 13, marginBottom: spacing.sm },
    formActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
    rowBody: { flex: 1 },
    rowTitle: { fontSize: 15, fontWeight: '600' },
    rowSub: { fontSize: 12, marginTop: 2 },
    iconBtn: { padding: 4 },
    addRow: { justifyContent: 'flex-start', borderStyle: 'dashed' },
    empty: { textAlign: 'center', paddingVertical: spacing.md, fontSize: 14 },
});

export default AddressBook;
