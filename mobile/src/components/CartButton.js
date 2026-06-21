import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useThemeColors } from '../theme/ThemeContext';

/**
 * Header cart entry point (RN port of CartButton): cart icon with a live badge
 * of the total item count. Opens the Cart screen.
 */
const CartButton = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { totalItems } = useCart();

    return (
        <Pressable
            onPress={() => navigation.navigate('Cart')}
            style={styles.btn}
            hitSlop={8}
            accessibilityLabel={`Cart, ${totalItems} items`}
        >
            <Ionicons name="cart-outline" size={24} color={c.text} />
            {totalItems > 0 && (
                <View style={[styles.badge, { backgroundColor: c.brand }]}>
                    <Text style={styles.badgeTxt}>{totalItems}</Text>
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    btn: { padding: 4 },
    badge: {
        position: 'absolute', top: -2, right: -4, minWidth: 18, height: 18, borderRadius: 9,
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
    },
    badgeTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
});

export default CartButton;
