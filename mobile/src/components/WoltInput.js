import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

/**
 * Labeled text field with inline error text — the RN equivalent of the web
 * WoltInput. Forwards the ref so screens can focus it, and spreads any extra
 * TextInput props (secureTextEntry, keyboardType, autoCapitalize, etc.).
 */
const WoltInput = React.forwardRef(({ label, error, style, rightSlot, ...props }, ref) => {
    const c = useThemeColors();
    return (
        <View style={styles.group}>
            {label ? <Text style={[styles.label, { color: c.text }]}>{label}</Text> : null}
            <View
                style={[
                    styles.inputWrap,
                    { backgroundColor: c.surface, borderColor: error ? c.danger : c.border },
                ]}
            >
                <TextInput
                    ref={ref}
                    placeholderTextColor={c.muted}
                    style={[styles.input, { color: c.text }, style]}
                    {...props}
                />
                {rightSlot}
            </View>
            {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}
        </View>
    );
});

const styles = StyleSheet.create({
    group: { marginBottom: spacing.md },
    label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.xs },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
    },
    input: { flex: 1, paddingVertical: spacing.sm + 4, fontSize: 16 },
    error: { fontSize: 12, marginTop: spacing.xs },
});

export default WoltInput;
