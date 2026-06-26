import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AddressBook from './AddressBook';
import { useUserLocation } from '../context/LocationContext';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

/**
 * Header location selector (RN port of LocationPill): an outlined pill that opens
 * a "Where to?" bottom sheet. The sheet body is the shared AddressBook, so the
 * header and Profile manage the exact same addresses.
 */
const LocationPill = () => {
    const c = useThemeColors();
    const loc = useUserLocation();
    const [open, setOpen] = useState(false);

    const label = loc.active ? loc.active.label : 'Set location';

    return (
        <>
            <Pressable onPress={() => setOpen(true)} style={[styles.pill, { borderColor: c.border }]}>
                <Ionicons name="location-sharp" size={15} color={c.brand} />
                <Text style={[styles.pillTxt, { color: c.text }]} numberOfLines={1}>{label}</Text>
                <Ionicons name="chevron-down" size={14} color={c.muted} />
            </Pressable>

            <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
                <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
                    <Pressable style={[styles.sheet, { backgroundColor: c.surface }]} onPress={() => {}}>
                        <View style={styles.head}>
                            <Text style={[styles.title, { color: c.text }]}>Where to?</Text>
                            <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                                <Ionicons name="close" size={22} color={c.muted} />
                            </Pressable>
                        </View>
                        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                            <AddressBook includeCurrentLocation onPick={() => setOpen(false)} />
                            {loc.active && (
                                <Pressable onPress={() => { loc.clearActive(); setOpen(false); }} style={styles.clear}>
                                    <Text style={[styles.clearTxt, { color: c.danger }]}>Clear location</Text>
                                </Pressable>
                            )}
                        </ScrollView>
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
    sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.md, maxHeight: '80%' },
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    title: { fontSize: 20, fontWeight: '800' },
    clear: { padding: spacing.md, alignItems: 'center' },
    clearTxt: { fontSize: 14, fontWeight: '700' },
});

export default LocationPill;
