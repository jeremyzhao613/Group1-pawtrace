import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pawtrace.app',
  appName: 'PawTrace',
  webDir: 'dist',
  backgroundColor: '#fff7f4',
  android: {
    backgroundColor: '#fff7f4',
  },
  ios: {
    backgroundColor: '#fff7f4',
    contentInset: 'always',
  },
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
      style: 'DARK',
    },
  },
};

export default config;
