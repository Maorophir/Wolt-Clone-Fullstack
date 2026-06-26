import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * expo-secure-store is not supported on the web because web browsers don't have
 * an encrypted Keychain/Keystore equivalent.
 * 
 * This wrapper automatically falls back to AsyncStorage on the web,
 * while using SecureStore securely on native platforms.
 */

export const setItemAsync = async (key, value) => {
    if (Platform.OS === 'web') {
        return AsyncStorage.setItem(key, value);
    }
    return SecureStore.setItemAsync(key, value);
};

export const getItemAsync = async (key) => {
    if (Platform.OS === 'web') {
        return AsyncStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
};

export const deleteItemAsync = async (key) => {
    if (Platform.OS === 'web') {
        return AsyncStorage.removeItem(key);
    }
    return SecureStore.deleteItemAsync(key);
};
