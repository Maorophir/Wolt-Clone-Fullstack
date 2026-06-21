import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

/**
 * "Choose an image from the gallery" field. Returns the image as a base64 data
 * URI via onChange(dataUri) — the exact payload the server stores (the RN
 * equivalent of the web app's <input type=file> + FileReader.readAsDataURL).
 */
const ImagePickerField = ({ label, value, onChange, error, rounded = false, height = 160 }) => {
    const c = useThemeColors();
    const [busy, setBusy] = useState(false);

    const pick = async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
                Alert.alert('Permission needed', 'Allow photo library access to choose an image.');
                return;
            }
            setBusy(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.6,
                base64: true,
                allowsEditing: true,
            });
            if (!result.canceled && result.assets?.length) {
                const asset = result.assets[0];
                const mime = asset.mimeType || 'image/jpeg';
                onChange(`data:${mime};base64,${asset.base64}`);
            }
        } catch (e) {
            Alert.alert('Could not pick image', e?.message || 'Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const radius = rounded ? height / 2 : 12;

    return (
        <View style={styles.group}>
            {label ? <Text style={[styles.label, { color: c.text }]}>{label}</Text> : null}
            <Pressable
                onPress={pick}
                style={[
                    styles.box,
                    {
                        borderColor: error ? c.danger : c.border,
                        backgroundColor: c.surface,
                        height,
                        borderRadius: radius,
                        width: rounded ? height : undefined,
                        alignSelf: rounded ? 'center' : 'stretch',
                    },
                ]}
            >
                {value ? (
                    <Image source={{ uri: value }} style={[styles.img, { borderRadius: radius }]} />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons
                            name={busy ? 'hourglass-outline' : 'camera-outline'}
                            size={28}
                            color={c.muted}
                        />
                        <Text style={[styles.hint, { color: c.muted }]}>
                            {busy ? 'Loading…' : 'Tap to choose a photo'}
                        </Text>
                    </View>
                )}
            </Pressable>
            {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    group: { marginBottom: spacing.md },
    label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.xs },
    box: { borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    img: { width: '100%', height: '100%' },
    placeholder: { alignItems: 'center', gap: 6 },
    hint: { fontSize: 13 },
    error: { fontSize: 12, marginTop: spacing.xs },
});

export default ImagePickerField;
