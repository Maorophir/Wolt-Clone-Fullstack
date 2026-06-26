import React from 'react';
import { Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';
import { shadow } from '../theme/shadows';

/**
 * Themed button used across the app. Variants: primary (brand fill), danger
 * (red fill), outline (brand border). Shows a spinner when `loading`.
 */
const Button = ({ title, onPress, loading, disabled, variant = 'primary', style, textStyle }) => {
    const c = useThemeColors();
    const fill = variant === 'primary' ? c.brand : variant === 'danger' ? c.danger : 'transparent';
    const fg = variant === 'outline' ? c.brand : '#FFFFFF';
    const isDisabled = disabled || loading;

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            style={({ pressed }) => [
                styles.btn,
                variant === 'primary' && !isDisabled ? shadow(2) : null,
                {
                    backgroundColor: fill,
                    borderColor: c.brand,
                    borderWidth: variant === 'outline' ? 1.5 : 0,
                    opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
                },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={fg} />
            ) : (
                <Text style={[styles.txt, { color: fg }, textStyle]}>{title}</Text>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    btn: {
        borderRadius: 24,
        paddingVertical: spacing.md - 2,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    txt: { fontSize: 16, fontWeight: '700' },
});

export default Button;
