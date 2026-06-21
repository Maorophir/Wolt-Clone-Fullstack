import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CartButton from '../components/CartButton';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

/**
 * The right-hand header actions shared across the main tabs (RN equivalent of the
 * web navbar's right side): a theme toggle and the cart button with its live badge.
 */
export const HeaderRight = () => {
    const { isDarkMode, toggleTheme, colors: c } = useTheme();
    return (
        <View style={styles.right}>
            <Pressable onPress={toggleTheme} hitSlop={8} style={styles.iconBtn} accessibilityLabel="Toggle theme">
                <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={22} color={c.text} />
            </Pressable>
            <CartButton />
        </View>
    );
};

const styles = StyleSheet.create({
    right: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingRight: spacing.md },
    iconBtn: { padding: 2 },
});
