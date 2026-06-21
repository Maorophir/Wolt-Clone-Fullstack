import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/ThemeContext';

/**
 * Themed screen container. The navigation header + bottom tab bar already handle
 * the safe-area insets, so this just paints the themed background and optionally
 * wraps content in a ScrollView.
 */
const Screen = ({ children, scroll = false, style, contentContainerStyle }) => {
    const c = useThemeColors();
    if (scroll) {
        return (
            <ScrollView
                style={[styles.flex, { backgroundColor: c.bg }, style]}
                contentContainerStyle={[styles.content, contentContainerStyle]}
                keyboardShouldPersistTaps="handled"
            >
                {children}
            </ScrollView>
        );
    }
    return <View style={[styles.flex, { backgroundColor: c.bg }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { flexGrow: 1 },
});

export default Screen;
