import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserLocation } from '../context/LocationContext';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

/**
 * Header location selector (RN port of LocationPill): an outlined pill that opens
 * a "Where to?" bottom sheet with "use my current location", saved addresses and
 * a clear action. Backed by the shared LocationContext.
 */
const LocationPill = () => {
    const c = useThemeColors();
    const loc = useUserLocation();
    const [open, setOpen] = useState(false);

    const label = loc.active ? loc.active.label : 'Set location';

    const onUseCurrent = async () => {
        const r = await loc.useCurrentLocation();
        if (r) setOpen(false);
    };
    const onPick = (a) => { loc.selectAddress(a); setOpen(false); };

    return (
        <>
            <Pressable onPress={() => setOpen(true)} style={[styles.pill, { borderColor: c.border }]}>
                <Ionicons name="location-sharp" size={15} color={c.brand} />
                <Text style={[styles.pillTxt, { color: c.text }]} numberOfLines={1}>{label}</Text>
                <Ionicons name="chevron-down" size={14} color={c.muted} />
            </Pressable>

            <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
                <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
                    <Pressable style={[styles.sheet, { backgroundColor: c.surface }]} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.head}>
                            <Text style={[styles.title, { color: c.text }]}>Where to?</Text>
                            <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                                <Ionicons name="close" size={22} color={c.muted} />
                            </Pressable>
                        </View>

                        <Pressable onPress={onUseCurrent} style={[styles.option, { borderColor: c.border }]}>
                            {loc.status === 'loading'
                                ? <ActivityIndicator color={c.brand} />
                                : <Ionicons name="navigate" size={18} color={c.brand} />}
                            <Text style={[styles.optionTxt, { color: c.brand }]}>Use my current location</Text>
                        </Pressable>
                        {loc.status === 'denied' && <Text style={[styles.err, { color: c.danger }]}>Location permission denied.</Text>}
                        {loc.status === 'unavailable' && <Text style={[styles.err, { color: c.danger }]}>Could not get your location.</Text>}

                        <FlatList
                            data={loc.addresses}
                            keyExtractor={(a) => String(a.id)}
                            style={styles.list}
                            ListEmptyComponent={<Text style={[styles.empty, { color: c.muted }]}>No saved addresses yet.</Text>}
                            renderItem={({ item }) => (
                                <Pressable onPress={() => onPick(item)} style={[styles.addr, { borderColor: c.border }]}>
                                    <Ionicons name="home-outline" size={18} color={c.muted} />
                                    <View style={styles.addrInfo}>
                                        <Text style={[styles.addrLabel, { color: c.text }]}>{item.label}</Text>
                                        {item.address ? <Text style={[styles.addrSub, { color: c.muted }]} numberOfLines={1}>{item.address}</Text> : null}
                                    </View>
                                </Pressable>
                            )}
                        />

                        {loc.active && (
                            <Pressable onPress={() => { loc.clearActive(); setOpen(false); }} style={styles.clear}>
                                <Text style={[styles.clearTxt, { color: c.danger }]}>Clear location</Text>
                            </Pressable>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    pill: {
        flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 5, maxWidth: 190,
    },
    pillTxt: { fontSize: 13, fontWeight: '600', flexShrink: 1 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.md, maxHeight: '72%' },
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    title: { fontSize: 20, fontWeight: '800' },
    option: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: 12, padding: spacing.md },
    optionTxt: { fontSize: 15, fontWeight: '700' },
    err: { fontSize: 13, marginTop: spacing.xs },
    list: { marginTop: spacing.sm },
    addr: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: 12, padding: spacing.md, marginTop: spacing.sm },
    addrInfo: { flex: 1 },
    addrLabel: { fontSize: 15, fontWeight: '600' },
    addrSub: { fontSize: 12, marginTop: 2 },
    empty: { textAlign: 'center', padding: spacing.md, fontSize: 14 },
    clear: { padding: spacing.md, alignItems: 'center' },
    clearTxt: { fontSize: 14, fontWeight: '700' },
});

export default LocationPill;
