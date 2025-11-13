import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import AppNavigation from '@src/navigations';
import MobileAds from 'react-native-google-mobile-ads';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AdsBanner from '@src/components/AdsBanner';

const App = () => {
  useEffect(() => {
    MobileAds()
      .initialize()
      .then(adapterStatuses => {
        // Initialization complete!
      });
  }, []);
  return (
    <SafeAreaProvider>
      <AppNavigation />
      <AdsBanner />
    </SafeAreaProvider>
  );
};

export default App;
