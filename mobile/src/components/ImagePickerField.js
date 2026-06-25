import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

const getInitials = (name) => {
    if (!name) return '?';
    return name.trim().split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
};

const getAvatarColor = (name) => {
    const colors = ['#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB', '#64B5F6', '#4FC3F7', '#4DD0E1', '#4DB6AC', '#81C784'];
    let sum = 0;
    if (name) {
        for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
};

/**
 * "Choose an image from the gallery" field. Returns the image as a base64 data
 * URI via onChange(dataUri) — the exact payload the server stores (the RN
 * equivalent of the web app's <input type=file> + FileReader.readAsDataURL).
 */
const ImagePickerField = ({ label, value, onChange, error, rounded = false, height = 160, fallbackName }) => {
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

    const boxContent = (
        <>
            {value ? (
                <Image source={{ uri: value }} style={[styles.img, { borderRadius: radius }]} />
            ) : (fallbackName && rounded) ? (
                <View style={{ width: '100%', height: '100%', borderRadius: radius, alignItems: 'center', justifyContent: 'center', backgroundColor: getAvatarColor(fallbackName) }}>
                    <Text style={{ fontSize: height * 0.35, color: '#ffffff', fontWeight: '800' }}>
                        {getInitials(fallbackName)}
                    </Text>
                </View>
            ) : (
                <View style={styles.placeholder}>
                    <Ionicons
                        name={busy ? 'hourglass-outline' : (rounded ? 'person-circle-outline' : 'camera-outline')}
                        size={rounded ? height * 0.7 : 40}
                        color={c.muted}
                    />
                    {!rounded && (
                        <Text style={[styles.hint, { color: c.muted, marginTop: 4 }]}>
                            {busy ? 'Loading…' : 'Tap to Choose a Photo'}
                        </Text>
                    )}
                </View>
            )}
        </>
    );

    const boxStyles = [
        styles.box,
        {
            borderColor: error ? c.danger : c.border,
            backgroundColor: c.surface,
            height,
            borderRadius: radius,
            width: rounded ? height : undefined,
            alignSelf: rounded ? 'center' : 'stretch',
        },
    ];

    return (
        <View style={styles.group}>
            {label ? <Text style={[styles.label, { color: c.text }]}>{label}</Text> : null}
            
            {rounded ? (
                <View style={boxStyles}>
                    {boxContent}
                </View>
            ) : (
                <Pressable onPress={pick} style={boxStyles}>
                    {boxContent}
                </Pressable>
            )}
            
            {/* If it's a rounded avatar, make the text underneath the only clickable part */}
            {rounded && (
                <Pressable onPress={pick} style={{ marginTop: spacing.sm, alignSelf: 'center', padding: 4 }}>
                    <Text style={{ textAlign: 'center', color: c.brand, fontWeight: '600', fontSize: 13 }}>
                        {busy ? 'Loading…' : value ? 'Change Photo' : 'Upload Photo'}
                    </Text>
                </Pressable>
            )}

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
