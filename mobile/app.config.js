// Expo dynamic config — replaces app.json so we can load developer-specific settings.
// Each developer creates their own 'local.config.json' (gitignored) with their IP.
// Developers who don't need an override (e.g., not on WSL) don't create the file at all.

let localConfig = {};
try {
  localConfig = require('./local.config.json');
} catch (e) {
  // No local config found — that's perfectly fine, auto-detect will handle it.
}

export default {
  expo: {
    name: "mobile",
    slug: "mobile",
    extra: {
      apiUrl: localConfig.apiUrl || null, // null = let client.js auto-detect
    },
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      edgeToEdgeEnabled: true,
    },
    plugins: [
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow WoltClone to access your photos to set a profile or restaurant image.",
        },
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "Allow WoltClone to use your location to show nearby restaurants and delivery distance.",
        },
      ],
      "expo-font",
    ],
  },
};
