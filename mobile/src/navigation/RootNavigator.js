import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import RestaurantMenu from '../screens/RestaurantMenu';
import Cart from '../screens/Cart';
import Checkout from '../screens/Checkout';
import OrderConfirmation from '../screens/OrderConfirmation';
import Login from '../screens/Login';
import Register from '../screens/Register';
import AddRestaurant from '../screens/AddRestaurant';
import EditRestaurant from '../screens/EditRestaurant';
import ManageMenu from '../screens/ManageMenu';
import CartButton from '../components/CartButton';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { spacing } from '../theme/spacing';

const Stack = createNativeStackNavigator();

/**
 * Root native-stack (RN equivalent of the web Routes). Holds the tab navigator
 * plus the drill-down/modal screens that push over the tabs. 
 * Conditionally renders Auth stack or Main stack based on auth state.
 */
export default function RootNavigator() {
    const { colors: c } = useTheme();
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={c.brand} />
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: c.navbarBg },
                headerTintColor: c.text,
                headerShadowVisible: false,
                contentStyle: { backgroundColor: c.bg },
            }}
        >
            {!isAuthenticated ? (
                // --- AUTH STACK (Logged Out) ---
                <>
                    <Stack.Screen name="Login" component={Login} options={{ title: 'Log in', headerShown: false }} />
                    <Stack.Screen name="Register" component={Register} options={{ title: 'Sign up', headerShown: false }} />
                </>
            ) : (
                // --- MAIN APP (Logged In) ---
                <>
                    <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
                    <Stack.Screen
                        name="Restaurant"
                        component={RestaurantMenu}
                        options={{
                            title: '',
                            headerRight: () => <View style={{ paddingRight: spacing.sm }}><CartButton /></View>,
                        }}
                    />
                    <Stack.Screen name="Cart" component={Cart} options={{ title: 'Your cart' }} />
                    <Stack.Screen name="Checkout" component={Checkout} options={{ title: 'Checkout' }} />
                    <Stack.Screen
                        name="OrderConfirmation"
                        component={OrderConfirmation}
                        options={{ title: 'Order placed', headerBackVisible: false }}
                    />
                    <Stack.Screen name="AddRestaurant" component={AddRestaurant} options={{ title: 'Add restaurant' }} />
                    <Stack.Screen name="EditRestaurant" component={EditRestaurant} options={{ title: 'Edit restaurant' }} />
                    <Stack.Screen name="ManageMenu" component={ManageMenu} options={{ title: 'Manage menu' }} />
                </>
            )}
        </Stack.Navigator>
    );
}
