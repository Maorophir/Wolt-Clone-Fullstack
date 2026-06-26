import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

/**
 * Search input (RN port of SearchBar). Controlled by the Search screen; submits
 * on the keyboard's "search" key. The web's responsive collapse/expand isn't
 * needed on a phone, so this is always the full pill input.
 */
const SearchBar = ({ value, onChangeText, onSubmit, autoFocus }) => {
    const c = useThemeColors();
    return (
        <View style={[styles.wrap, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Ionicons name="search" size={18} color={c.muted} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
                placeholder="Search in Wolt..."
                placeholderTextColor={c.muted}
                returnKeyType="search"
                autoFocus={autoFocus}
                style={[styles.input, { color: c.text }]}
            />
            {value ? (
                <Pressable onPress={() => onChangeText('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color={c.muted} />
                </Pressable>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: 24,
        paddingHorizontal: spacing.md, height: 46, marginHorizontal: spacing.md, marginVertical: spacing.sm,
    },
    input: { flex: 1, fontSize: 16 },
});

export default SearchBar;
