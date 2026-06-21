import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import RestaurantMenu from '../screens/RestaurantMenu';
import Cart from '../screens/Cart';
import Checkout from '../screens/Checkout';
import OrderConfirmation from '../screens/OrderConfirmation';
import Login from '../screens/Login';
import Register from '../screens/Register';
import CartButton from '../components/CartButton';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

const Stack = createNativeStackNavigator();

/**
 * Root native-stack (RN equivalent of the web Routes). Holds the tab navigator
 * plus the drill-down/modal screens that push over the tabs. Protected screens
 * (Checkout) self-guard via useRequireAuth.
 */
export default function RootNavigator() {
    const { colors: c } = useTheme();
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: c.navbarBg },
                headerTintColor: c.text,
                headerShadowVisible: false,
                contentStyle: { backgroundColor: c.bg },
            }}
        >
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
            <Stack.Screen name="Login" component={Login} options={{ title: 'Log in' }} />
            <Stack.Screen name="Register" component={Register} options={{ title: 'Sign up' }} />
        </Stack.Navigator>
    );
}
