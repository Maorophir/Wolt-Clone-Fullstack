import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import Screen from '../components/Screen';
import WoltInput from '../components/WoltInput';
import Button from '../components/Button';
import ImagePickerField from '../components/ImagePickerField';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getCurrentPosition } from '../utils/geo';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

const genId = () => `a_${Date.now()}_${Math.random().toString(36).slice(2)}`;

/**
 * Register screen (RN port of pages/Register.js + hooks/useRegister.js). Mirrors
 * the web validation exactly: required fields, username >= 3, password >= 8 with
 * letters and numbers, matching confirmation, and optional paired/ranged
 * coordinates. Profile photo via the gallery; optional first delivery address.
 */
export default function Register({ navigation }) {
    const { colors: c, isDarkMode } = useTheme();
    const { login } = useAuth();
    const [form, setForm] = useState({
        displayName: '', username: '', password: '', confirmPassword: '',
        isBusinessOwner: false, label: 'Home', address: '', latitude: '', longitude: '',
    });
    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);

    const set = (k) => (v) => {
        setForm((p) => ({ ...p, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
    };

    const useMyLocation = async () => {
        setLocating(true);
        setErrors((e) => ({ ...e, location: '' }));
        try {
            const { lat, lng } = await getCurrentPosition();
            setForm((p) => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
        } catch (err) {
            setErrors((e) => ({
                ...e,
                location: err && err.code === 1
                    ? 'Location was blocked — enter coordinates manually.'
                    : 'Could not get your location — enter coordinates manually.',
            }));
        } finally {
            setLocating(false);
        }
    };

    const validate = () => {
        const e = {};
        if (!form.displayName.trim()) e.displayName = 'Display name is required';

        if (!form.username.trim()) e.username = 'Username is required';
        else if (form.username.length < 3) e.username = 'Username must be at least 3 characters';

        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
        else if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)) e.password = 'Password must contain letters and numbers';

        if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
        else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

        const hasLat = String(form.latitude).trim() !== '';
        const hasLng = String(form.longitude).trim() !== '';
        if (hasLat !== hasLng) {
            e.location = 'Provide both latitude and longitude, or leave both empty.';
        } else if (hasLat) {
            const la = Number(form.latitude);
            const lo = Number(form.longitude);
            if (!Number.isFinite(la) || la < -90 || la > 90 || !Number.isFinite(lo) || lo < -180 || lo > 180) {
                e.location = 'Latitude must be -90..90 and longitude -180..180.';
            }
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        setErrors((e) => ({ ...e, submit: '' }));
        try {
            const addresses = String(form.latitude).trim() !== ''
                ? [{
                    id: genId(),
                    label: form.label.trim() || 'Home',
                    address: form.address.trim(),
                    latitude: Number(form.latitude),
                    longitude: Number(form.longitude),
                }]
                : undefined;

            await api('/users', {
                method: 'POST',
                body: {
                    displayName: form.displayName,
                    username: form.username,
                    password: form.password,
                    profileImage: image || '',
                    isBusinessOwner: form.isBusinessOwner,
                    ...(addresses ? { addresses } : {}),
                },
            });

            await login(form.username, form.password);
        } catch (err) {
            setErrors((e) => ({ ...e, submit: err.message || 'Registration failed. Please try again.' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Screen scroll contentContainerStyle={styles.content}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={{ alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.md }}>
                    <Image 
                        source={require('../../assets/WoltClone_Logo.png')} 
                        style={{ width: '90%', height: 140, tintColor: isDarkMode ? '#FFFFFF' : undefined }} 
                        resizeMode="contain" 
                    />
                </View>
                <Text style={[styles.title, { color: c.text }]}>Create your account</Text>

                {errors.submit ? (
                    <Text style={[styles.errorBox, { backgroundColor: 'rgba(192,57,43,0.12)', color: c.danger }]}>{errors.submit}</Text>
                ) : null}

                <ImagePickerField 
                    label="Profile photo (optional)" 
                    value={image} 
                    onChange={setImage} 
                    rounded 
                    height={110} 
                    error={errors.image} 
                />

                <WoltInput label="Display name" value={form.displayName} onChangeText={set('displayName')} placeholder="Your name" editable={!loading} error={errors.displayName} />
                <WoltInput label="Username" value={form.username} onChangeText={set('username')} placeholder="Choose a username" autoCapitalize="none" autoCorrect={false} editable={!loading} error={errors.username} />
                <WoltInput label="Password" value={form.password} onChangeText={set('password')} placeholder="8+ chars, letters and numbers" secureTextEntry autoCapitalize="none" editable={!loading} error={errors.password} />
                <WoltInput label="Confirm password" value={form.confirmPassword} onChangeText={set('confirmPassword')} placeholder="Re-enter password" secureTextEntry autoCapitalize="none" editable={!loading} error={errors.confirmPassword} />

                <View style={[styles.switchRow, { borderColor: c.border }]}>
                    <View style={styles.switchInfo}>
                        <Text style={[styles.switchLabel, { color: c.text }]}>Business owner</Text>
                        <Text style={[styles.switchSub, { color: c.muted }]}>Register restaurants and manage menus</Text>
                    </View>
                    <Switch
                        value={form.isBusinessOwner}
                        onValueChange={(v) => setForm((p) => ({ ...p, isBusinessOwner: v }))}
                        trackColor={{ true: c.brand }}
                    />
                </View>

                <Text style={[styles.section, { color: c.text }]}>Delivery location (optional)</Text>
                <WoltInput label="Label" value={form.label} onChangeText={set('label')} placeholder="Home / Work" editable={!loading} />
                <WoltInput label="Address" value={form.address} onChangeText={set('address')} placeholder="Street, city" editable={!loading} />
                <View style={styles.coordRow}>
                    <View style={styles.coordCol}>
                        <WoltInput label="Latitude" value={String(form.latitude)} onChangeText={set('latitude')} placeholder="32.07" keyboardType="numbers-and-punctuation" editable={!loading} />
                    </View>
                    <View style={styles.coordCol}>
                        <WoltInput label="Longitude" value={String(form.longitude)} onChangeText={set('longitude')} placeholder="34.78" keyboardType="numbers-and-punctuation" editable={!loading} />
                    </View>
                </View>
                <Button title="Use my current location" variant="outline" onPress={useMyLocation} loading={locating} />
                {errors.location ? <Text style={[styles.err, { color: c.danger }]}>{errors.location}</Text> : null}

                <Button title="Sign Up" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.md }} />

                <View style={styles.footer}>
                    <Text style={{ color: c.muted }}>Already have an account? </Text>
                    <Pressable onPress={() => navigation.replace('Login')}>
                        <Text style={{ color: c.brand, fontWeight: '700' }}>Log in</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: { padding: spacing.lg },
    title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
    errorBox: { padding: spacing.md, borderRadius: 10, marginBottom: spacing.md, textAlign: 'center', fontWeight: '600' },
    switchRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
    switchInfo: { flex: 1 },
    switchLabel: { fontSize: 15, fontWeight: '700' },
    switchSub: { fontSize: 12, marginTop: 2 },
    section: { fontSize: 16, fontWeight: '800', marginBottom: spacing.sm, marginTop: spacing.xs },
    coordRow: { flexDirection: 'row', gap: spacing.sm },
    coordCol: { flex: 1 },
    err: { fontSize: 13, marginTop: spacing.xs },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg, marginBottom: spacing.xl },
});
