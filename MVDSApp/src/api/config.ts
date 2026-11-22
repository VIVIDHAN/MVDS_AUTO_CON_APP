import { Platform } from 'react-native';

// Automatic platform base URL resolution:
// - Android Emulator uses 10.0.2.2
// - Physical device on local WiFi uses 192.168.31.175
// - iOS Simulator uses localhost
export const DEFAULT_HOST = Platform.select({
  android: '10.0.2.2',
  default: 'localhost'
});

export const LAN_HOST = '192.168.31.175';
export const PORT = '5001';

export let BASE_URL = `http://${DEFAULT_HOST}:${PORT}/api`;

export const setCustomBaseUrl = (newUrl: string) => {
  BASE_URL = newUrl;
};
