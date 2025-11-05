import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ComicDetailScreen from '@src/screens/comic-detail';
import ComicReaderScreen from '@src/screens/comic-reader';
import MainScreen from '@src/screens/main';
import { TAppNavigationParam } from '@src/utils/types/navigation.types';

const Stack = createNativeStackNavigator<TAppNavigationParam>();
export const navigationRef =
  createNavigationContainerRef<TAppNavigationParam>();
const AppNavigation = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="ComicDetail" component={ComicDetailScreen} />
        <Stack.Screen name="ComicReader" component={ComicReaderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
