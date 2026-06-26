import * as SecureStore from '../utils/storage';
import Constants from 'expo-constants';

/**
 * Auto-detect the dev machine's IP from the Expo dev server.
 * Expo already knows it (that's how your phone connected!).
 * We just grab that IP and swap the port to 3001 (your API server).
 *
 * This means NO developer needs to hardcode their IP — it just works
 * on every machine, every network, for every team member.
 */
const getApiBase = () => {

  // Priority 1: Manual override via app.json extra config.
  // WSL/tunnel users set this in app.json under "expo.extra.apiUrl"
  const manualUrl = Constants.expoConfig?.extra?.apiUrl;
  if (manualUrl) {
    return manualUrl;
  }

  // Priority 2: Auto-detect from Expo dev server (not tunnel mode)
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ||   // Expo Go
    Constants.manifest?.debuggerHost;          // Older SDKs fallback
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0]; // "192.168.1.62:8081" → "192.168.1.62"
    return `http://${ip}:3001/api`;
  }
  
  // Fallback (shouldn't happen in dev, but just in case)
  return 'http://localhost:3001/api';
};

const API_BASE = getApiBase();

/**
 * A thin wrapper around the native fetch() that:
 * 1. Prepends the API base URL (so you write '/restaurants' not the full URL)
 * 2. Auto-attaches the JWT token from SecureStore (like an Axios interceptor)
 * 3. Auto-parses JSON responses
 * 4. Throws on non-2xx status codes (fetch normally doesn't!)
 *
 * Usage:
 *   const restaurants = await api('/restaurants');
 *   const user = await api('/tokens', { method: 'POST', body: { email, password } });
 */
const api = async (endpoint, options = {}) => {
  // --- Step 1: Build headers ---
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,  // Allow caller to override if needed
  };

  // --- Step 2: Attach JWT token (same idea as an Axios interceptor) ---
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // --- Step 3: Make the request ---
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    // If body is an object, stringify it. fetch() requires a string body.
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // --- Step 4: Parse response ---
  // Some responses (like 204 No Content) have no body, so we handle that.
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  // --- Step 5: Throw on error (fetch doesn't do this by default!) ---
  if (!response.ok) {
    // Server uses `error` on most routes but `message` on user creation/validation.
    const error = new Error(data?.error || data?.message || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return { data, status: response.status, headers: response.headers };
};

export default api;
