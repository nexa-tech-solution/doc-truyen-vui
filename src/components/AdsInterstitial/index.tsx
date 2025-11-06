import { View, Platform, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';
import ADS_IDS from '@src/constants/ads.constants';
import { useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation();

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
      interstitial.show();
      setLoaded(false); // prevent re-showing on re-render
    }
  }, [loaded]);

  return <View />;
};

export default AdsInterstitial;
