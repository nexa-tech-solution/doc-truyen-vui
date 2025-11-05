import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { ArrowLeft, ArrowRight, ChevronUp } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ComicReaderScreen = ({ route, navigation }: any) => {
  const comic = route?.params?.comic ?? {
    name: 'Đại Quản Gia Là Ma Hoàng',
    chap: 770,
    images: [
      'https://drive.google.com/file/d/1FnVC8oMtpcUnsrUj_wzmwYGKX2G7HxdR/view?usp=sharing',
      'https://drive.google.com/file/d/14BY59udBVV1g1IGVlPD4Sos4XH8qxBY6/view?usp=sharing',
      'https://drive.google.com/file/d/1rN4SUbuiVkVUZjCjjRxKIkhBCE92uE5Q/view?usp=sharing',
      'https://drive.google.com/file/d/1tJyTBzn9S9kEsJGJDiJ4c79CZwDg8sAU/view?usp=sharing',
      'https://drive.google.com/file/d/18mnWwAdfcHItLHakVjjqRv1kDcJ1L5_N/view?usp=sharing',
    ],
  };
  const toDirectDriveUrl = (viewUrl: string) => {
    const match = viewUrl.match(/\/d\/(.*?)\//);
    if (!match) return viewUrl;
    const fileId = match[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  };
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [scrollUpVisible, setScrollUpVisible] = useState(false);
  const [ratios, setRatios] = useState<{ [key: number]: number }>({});

  const onImageLoad = (index: number, w: number, h: number) => {
    setRatios(prev => ({ ...prev, [index]: h / w }));
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <Animated.View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color="#fff" size={22} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {comic.name}
          </Text>
          <Text style={styles.subTitle}>Chap {comic.chap}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.nextButton}
        >
          <Text style={styles.title}>Chap 771</Text>
          <ArrowRight color="#fff" size={14} />
        </TouchableOpacity>
      </Animated.View>

      {/* Images */}
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scroll}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {comic.images.map((img: string, i: number) => {
          const ratio = ratios[i] ?? 1.5;
          return (
            <Image
              key={i}
              source={{ uri: toDirectDriveUrl(img) }}
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_WIDTH * ratio,
                backgroundColor: '#111',
              }}
              resizeMode="contain"
              onLoad={e => {
                const { width, height } = e.nativeEvent.source;
                onImageLoad(i, width, height);
              }}
            />
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>— Hết chap {comic.chap} —</Text>
        </View>
      </Animated.ScrollView>

      {/* Scroll-up button */}
      {scrollUpVisible && (
        <TouchableOpacity style={styles.scrollTopBtn} onPress={scrollToTop}>
          <ChevronUp color="black" size={22} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default ComicReaderScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(0,0,0,0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  headerContent: {
    flex: 1,
  },
  backButton: { padding: 4 },
  nextButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  title: { color: '#fff', fontWeight: '700', fontSize: 15, maxWidth: 180 },
  subTitle: { color: '#bbb', fontSize: 12 },
  scroll: { flex: 1 },
  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { color: '#777', fontSize: 13, fontStyle: 'italic' },
  scrollTopBtn: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
});
