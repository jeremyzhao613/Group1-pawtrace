import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jeremy.pawtrace.ysvhwxy9n6',
  appName: 'PawTrace',
  webDir: 'dist',
  backgroundColor: '#fff7f4',
  server: {
    cleartext: true,
  },
  android: {
    backgroundColor: '#fff7f4',
    allowMixedContent: true,
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
