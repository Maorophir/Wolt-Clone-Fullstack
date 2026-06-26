import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import WoltInput from '../components/WoltInput';
import Button from '../components/Button';
import AnimatedLogo from '../components/AnimatedLogo';
import { useAuth } from '../context/AuthContext';
import { useThemeColors } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

/**
 * Login screen (RN port of pages/Login.js + hooks/useLogin.js). Validates that
 * both fields are filled, then calls AuthContext.login. On success it returns to
 * wherever the user came from (e.g. a protected screen that bounced them here).
 */
export default function Login({ navigation }) {
    const c = useThemeColors();
    const { login } = useAuth();
    const [form, setForm] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const set = (k) => (v) => {
        setForm((p) => ({ ...p, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.username.trim()) e.username = 'Username is required';
        if (!form.password) e.password = 'Password is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        setErrors((e) => ({ ...e, submit: '' }));
        try {
            await login(form.username.trim(), form.password);
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('MainTabs');
        } catch (err) {
            setErrors((e) => ({ ...e, submit: err.message || 'Login failed' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Screen scroll contentContainerStyle={styles.content}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <AnimatedLogo style={{ marginBottom: spacing.md }} />
                <Text style={[styles.title, { color: c.text }]}>Log in to your account</Text>

                {errors.submit ? (
                    <Text style={[styles.errorBox, { backgroundColor: 'rgba(192,57,43,0.12)', color: c.danger }]}>{errors.submit}</Text>
                ) : null}

                <WoltInput
                    label="Username"
                    value={form.username}
                    onChangeText={set('username')}
                    placeholder="Enter your username"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    error={errors.username}
                />
                <WoltInput
                    label="Password"
                    value={form.password}
                    onChangeText={set('password')}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                    error={errors.password}
                    rightSlot={
                        <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.muted} />
                        </Pressable>
                    }
                />

                <Button title="Log In" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.sm }} />

                <View style={styles.footer}>
                    <Text style={{ color: c.muted }}>Don't have an account yet? </Text>
                    <Pressable onPress={() => navigation.navigate('Register')}>
                        <Text style={{ color: c.brand, fontWeight: '700' }}>Sign up here</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: { padding: spacing.lg, flexGrow: 1, justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: spacing.lg },
    errorBox: { padding: spacing.md, borderRadius: 10, marginBottom: spacing.md, textAlign: 'center', fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
});
