import React from 'react';
import { View, Text, Image, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

const initialsOf = (u) => {
    const s = (u?.displayName || u?.username || '?').trim();
    const parts = s.split(/\s+/);
    if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return s.slice(0, 2).toUpperCase();
};

/**
 * Profile (RN port of the web Navbar user menu + a basic profile view). Shows the
 * signed-in user, the dark-mode toggle (which lives in the navbar on web), and
 * logout. Protected. Full profile editing / address book is a later phase.
 */
export default function Profile() {
    const { isDarkMode, toggleTheme, colors: c } = useTheme();
    const { isAuthenticated } = useRequireAuth();
    const { user, logout } = useAuth();

    if (!isAuthenticated) {
        return <Screen style={styles.center}><Text style={{ color: c.muted }}>Please log in to view your profile.</Text></Screen>;
    }

    return (
        <Screen scroll contentContainerStyle={styles.content}>
            <View style={styles.header}>
                {user?.profileImage ? (
                    <Image source={{ uri: user.profileImage }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: c.brand }]}>
                        <Text style={styles.avatarTxt}>{initialsOf(user)}</Text>
                    </View>
                )}
                <Text style={[styles.name, { color: c.text }]}>{user?.displayName || user?.username}</Text>
                <Text style={[styles.username, { color: c.muted }]}>@{user?.username}</Text>
                {user?.isBusinessOwner ? (
                    <View style={[styles.badge, { backgroundColor: `${c.brand}22` }]}>
                        <Text style={[styles.badgeTxt, { color: c.brand }]}>Business owner</Text>
                    </View>
                ) : null}
            </View>

            <View style={[styles.row, { borderColor: c.border }]}>
                <Ionicons name="moon-outline" size={20} color={c.text} />
                <Text style={[styles.rowLabel, { color: c.text }]}>Dark mode</Text>
                <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ true: c.brand }} />
            </View>

            <Button title="Log out" variant="danger" onPress={logout} style={{ marginTop: spacing.lg }} />
        </Screen>
    );
}

const styles = StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center' },
    content: { padding: spacing.lg },
    header: { alignItems: 'center', marginBottom: spacing.xl },
    avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: spacing.md },
    avatarFallback: { alignItems: 'center', justifyContent: 'center' },
    avatarTxt: { color: '#fff', fontSize: 32, fontWeight: '800' },
    name: { fontSize: 22, fontWeight: '800' },
    username: { fontSize: 14, marginTop: 2 },
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: spacing.sm },
    badgeTxt: { fontSize: 12, fontWeight: '700' },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: 12, padding: spacing.md },
    rowLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
});
