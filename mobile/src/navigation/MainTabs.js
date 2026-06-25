import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Home from '../screens/Home';
import Search from '../screens/Search';
import Orders from '../screens/Orders';
import Profile from '../screens/Profile';
import LocationPill from '../components/LocationPill';
import { HeaderRight } from './AppHeader';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

const Tab = createBottomTabNavigator();

// Base Ionicons name per tab; filled when focused, outline otherwise.
const ICONS = { Home: 'home', Search: 'search', Orders: 'receipt', Profile: 'person' };

/**
 * Bottom-tab navigator (Wolt-like): Home, Search, Orders, Profile. The header
 * carries the theme toggle + cart on every tab, and the location pill on Home.
 */
export default function MainTabs() {
    const { colors: c } = useTheme();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: c.navbarBg },
                headerTintColor: c.text,
                headerTitleStyle: { fontWeight: '800' },
                headerShadowVisible: false,
                headerRight: () => <HeaderRight />,
                tabBarActiveTintColor: c.brand,
                tabBarInactiveTintColor: c.muted,
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
                tabBarStyle: { backgroundColor: c.navbarBg, borderTopColor: c.border },
                tabBarIcon: ({ color, size, focused }) => {
                    const base = ICONS[route.name] || 'ellipse';
                    return <Ionicons name={focused ? base : `${base}-outline`} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    headerTitle: '',
                    headerLeft: () => <View style={{ paddingLeft: spacing.md }}><LocationPill /></View>,
                }}
            />
            <Tab.Screen name="Search" component={Search} options={{ headerTitle: 'Search' }} />
            <Tab.Screen name="Orders" component={Orders} options={{ headerTitle: 'My orders' }} />
            <Tab.Screen name="Profile" component={Profile} options={{ headerTitle: 'Profile' }} />
        </Tab.Navigator>
    );
}
