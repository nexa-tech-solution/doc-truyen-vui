import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import AppNavigation from '@src/navigations';
import MobileAds from 'react-native-google-mobile-ads';

const App = () => {
  useEffect(() => {
    MobileAds()
      .initialize()
      .then(adapterStatuses => {
        // Initialization complete!
      });
  }, []);
  return <AppNavigation />;
};

export default App;
