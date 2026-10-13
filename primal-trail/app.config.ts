import type { ExpoConfig } from 'expo/config';

// Secrets come from the environment (see .env.example), never from git.
export default (): ExpoConfig => ({
  name: 'Primal Trail',
  slug: 'primal-trail',
  scheme: 'primaltrail',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.primaltrail.app',
  },
  android: {
    package: 'com.primaltrail.app',
    adaptiveIcon: {
      backgroundColor: '#1F3A2B',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: { favicon: './assets/favicon.png', output: 'single' },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Primal Trail uses your location to show creatures and resources near you. It is never shown to other players.',
      },
    ],
    // Android needs a Google Maps key; iOS uses Apple Maps without one.
    ['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY }],
  ],
});
