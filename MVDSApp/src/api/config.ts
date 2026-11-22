import { Platform } from 'react-native';

// Live production API endpoint on Lytic_Server_01 (AWS EC2 Mumbai)
export const PRODUCTION_API_URL = 'https://lytic.co.in/api/mvds';

// Automatic platform base URL resolution for local debugging:
export const DEFAULT_HOST = Platform.select({
  android: '10.0.2.2',
  default: 'localhost'
});

export const LAN_HOST = '192.168.31.175';
export const PORT = '5002';

// Default to live production server URL for all physical device APK installs
export let BASE_URL = PRODUCTION_API_URL;

export const setCustomBaseUrl = (newUrl: string) => {
  BASE_URL = newUrl;
};
