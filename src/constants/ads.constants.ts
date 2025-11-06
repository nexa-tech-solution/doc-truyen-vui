import { Platform } from 'react-native';

const ADS_IDS = Platform.select({
  android: {
    banner: 'ca-app-pub-9163464406132797/1426219191',
    interstitial: 'ca-app-pub-9163464406132797/2300317163',
  },
  ios: {
    banner: 'ca-app-pub-9163464406132797/1426219191',
    interstitial: 'ca-app-pub-9163464406132797/2300317163',
  },
});

export default ADS_IDS;
