import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // ID univoco app su Play Store / dispositivo
  appId: 'it.xaicon.anistream',
  appName: 'AniStream',

  // Usa il build Vite
  webDir: 'dist',

  // ── Server per sviluppo locale ───────────────────────
  // Commenta questo blocco per il build APK di produzione!
  // server: {
  //   url: 'http://192.168.1.95:3000',
  //   cleartext: true,
  // },

  // ── Android config ───────────────────────────────────
  android: {
    // Permetti traffico HTTP (necessario per server locale)
    allowMixedContent: true,
    // Orientamento: portrait + landscape
    // minWebViewVersion: 60,
  },

  // ── Plugin config ────────────────────────────────────
  plugins: {
    // Barra di stato trasparente (look fullscreen)
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#080c14', // --background del tema
      overlaysWebView: false,
    },
    // Splash screen
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#080c14',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ff6600', // --primary
    },
    // Navigazione gesture Android (swipe back)
    EdgeToEdge: {
      backgroundColor: '#080c14',
    },
  },
};

export default config;
