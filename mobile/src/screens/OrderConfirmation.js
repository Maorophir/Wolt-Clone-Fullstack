import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Button from '../components/Button';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

/**
 * Order confirmation (RN port of pages/OrderConfirmation.js). Shown after an
 * order is placed; offers a way back to the feed or to the orders history.
 */
export default function OrderConfirmation({ navigation }) {
    const c = useThemeColors();
    return (
        <Screen style={styles.center}>
            <View style={[styles.check, { backgroundColor: c.brand }]}>
                <Ionicons name="checkmark" size={48} color="#fff" />
            </View>
            <Text style={[styles.title, { color: c.text }]}>Order placed!</Text>
            <Text style={[styles.sub, { color: c.muted }]}>Your order has been sent to the restaurant.</Text>
            <Button
                title="Back to restaurants"
                onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                style={styles.btn}
            />
            <Button
                title="View my orders"
                variant="outline"
                onPress={() => navigation.navigate('MainTabs', { screen: 'Orders' })}
                style={styles.btn}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
    check: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
    title: { fontSize: 24, fontWeight: '800' },
    sub: { fontSize: 15, marginTop: spacing.xs, marginBottom: spacing.xl, textAlign: 'center' },
    btn: { alignSelf: 'stretch', marginTop: spacing.sm },
});
