import { Platform, StyleSheet, View } from 'react-native';
import React, { useRef } from 'react';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
} from 'react-native-google-mobile-ads';
import ADS_IDS from '@src/constants/ads.constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const AD_ID = __DEV__ ? TestIds.ADAPTIVE_BANNER : ADS_IDS?.banner!;
const AdsBanner = () => {
  const insets = useSafeAreaInsets();
  const bannerRef = useRef<BannerAd>(null);
  useForeground(() => {
    Platform.OS === 'ios' && bannerRef.current?.load();
  });
  return (
    <View style={[style.overall, { paddingBottom: insets.bottom }]}>
      <BannerAd
        ref={bannerRef}
        unitId={AD_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
};

export default AdsBanner;

const style = StyleSheet.create({
  overall: {
    paddingTop: 5,
    backgroundColor: '#0d0d0d',
  },
});
