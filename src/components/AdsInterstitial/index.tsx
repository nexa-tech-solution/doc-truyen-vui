import { Platform, StatusBar } from 'react-native';
import { useEffect, useState } from 'react';
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';
import ADS_IDS from '@src/constants/ads.constants';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : ADS_IDS?.interstitial!;

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: [
    'reading',
    'novel',
    'story',
    'comic',
    'manga',
    'romance',
    'fantasy',
  ],
});

const AdsInterstitial = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setLoaded(true);
      },
    );

    const unsubscribeOpened = interstitial.addAdEventListener(
      AdEventType.OPENED,
      () => {
        if (Platform.OS === 'ios') {
          StatusBar.setHidden(true);
        }
      },
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        if (Platform.OS === 'ios') {
          StatusBar.setHidden(false);
        }
      },
    );

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeClosed();
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        interstitial.show();
      }, 30000);
      setLoaded(false); // prevent re-showing on re-render
    }
  }, [loaded]);

  return null;
};

export default AdsInterstitial;
