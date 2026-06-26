import React, { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function AnimatedLogo({ style }) {
    const { isDarkMode } = useTheme();
    // Initial values: invisible (opacity 0) and slightly shrunk (scale 0.5)
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;

    const startAnimation = () => {
        // Run both animations at the same time, but ONLY once the image is fully loaded
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1, // fully visible
                duration: 800, // Back to a normal speed
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1, // normal size
                friction: 4, // Bouncy
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    };

    return (
        <View style={styles.container}>
            <Animated.Image
                source={require('../../assets/WoltClone_Logo.png')}
                onLoad={startAnimation} // <--- The one that worked!
                style={[
                    styles.logo,
                    style,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                        tintColor: isDarkMode ? '#FFFFFF' : undefined
                    }
                ]}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '100%',
    },
    logo: {
        width: 320,
        height: 120,
    }
});
