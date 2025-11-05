import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';

const TabHeader = ({
  activeTab,
  onSwitch,
}: {
  activeTab: string;
  onSwitch: (t: 'all' | 'followed') => void;
}) => {
  const { width } = useWindowDimensions();
  const tabAnim = useRef(
    new Animated.Value(activeTab === 'all' ? 0 : 1),
  ).current;

  const handleTabSwitch = (tab: 'all' | 'followed') => {
    onSwitch(tab);
    Animated.timing(tabAnim, {
      toValue: tab === 'all' ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const indicatorLeft = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [width * 0.07, width * 0.53],
  });

  return (
    <View style={styles.tabWrapper}>
      {/* Tabs Row */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => handleTabSwitch('all')}
          style={styles.tabItem}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'all' && styles.tabTextActive,
            ]}
          >
            📚 Tất cả truyện
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabSwitch('followed')}
          style={styles.tabItem}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'followed' && styles.tabTextActive,
            ]}
          >
            ❤️ Đang theo dõi
          </Text>
        </TouchableOpacity>
      </View>

      {/* Animated Indicator */}
      <Animated.View
        style={[styles.indicatorContainer, { left: indicatorLeft }]}
      >
        <View style={styles.tabIndicator} />
      </Animated.View>
    </View>
  );
};

export default TabHeader;

const styles = StyleSheet.create({
  tabWrapper: {
    marginTop: 10,
    paddingHorizontal: 16,
    position: 'relative',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabText: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 4,
    width: '38%',
    alignItems: 'center',
  },
  tabIndicator: {
    height: 4,
    width: '90%',
    borderRadius: 3,
    shadowColor: '#ff6b00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
});
