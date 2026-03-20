

// capacitor.config.ts

import { CapacitorConfig } from '@capacitor/ts-core';

const config: CapacitorConfig = {
  appId: 'com.rabbit.buddy',
  appName: 'Rabbit',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true
  }
};

export default config;
