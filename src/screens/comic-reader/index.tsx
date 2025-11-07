import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image as RNImage,
  Image,
} from 'react-native';
import { ArrowLeft, ArrowRight, ChevronUp } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useComicStore } from '@src/zustand/useComicStore';
import TurboImage from 'react-native-turbo-image';
import { Zoomable } from '@likashefqet/react-native-image-zoom';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { navigationRef } from '@src/navigations';
import AdsBanner from '@src/components/AdsBanner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ComicReaderScreen = ({ route, navigation }: any) => {
  const { comicId, chapterId } = route.params as {
    comicId: string;
    chapterId: string;
  };

  const getComic = useComicStore(state => state.getComic);
  const getChapter = useComicStore(state => state.getChapter);

  const comic = getComic(comicId);
  const chapter = getChapter(comicId, chapterId);

  function toDirectDriveUrl(rawUrl: string) {
    const m1 = rawUrl.match(/\/d\/([^/]+)/);
    const m2 = rawUrl.match(/[?&]id=([^&]+)/);
    const fileId = m1?.[1] ?? m2?.[1];
    if (!fileId) return rawUrl;

    // 👇 Use "download" to force original file
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  const scrollRef = useRef<any>(null);
  const [scrollUpVisible, setScrollUpVisible] = useState(false);
  const [sizes, setSizes] = useState<{
    [key: number]: { w: number; h: number };
  }>({});

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > 300 && !scrollUpVisible) {
      setScrollUpVisible(true);
    } else if (y <= 300 && scrollUpVisible) {
      setScrollUpVisible(false);
    }
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  useEffect(() => {
    if (!chapter) return;

    let cancelled = false;

    const loadSizes = async () => {
      const entries = await Promise.all(
        chapter.links.map(
          (img, index) =>
            new Promise<[number, { w: number; h: number } | null]>(resolve => {
              const uri = toDirectDriveUrl(img);
              RNImage.getSize(
                uri,
                (w, h) => resolve([index, { w, h }]),
                () => resolve([index, null]),
              );
            }),
        ),
      );

      if (cancelled) return;

      const map: { [key: number]: { w: number; h: number } } = {};
      entries.forEach(([i, size]) => {
        if (size) map[i] = size;
      });
      setSizes(map);
    };

    loadSizes();
    return () => {
      cancelled = true;
    };
  }, [chapter]);
  if (!comic || !chapter) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', marginBottom: 12 }}>
            Không tìm thấy truyện hoặc chương
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: '#ff5b00' }}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  console.log(chapterId);
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        <View style={styles.header}>
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
            <Text style={styles.subTitle}>Chap {chapter.chapter}</Text>
          </View>
          {comic.chapters[0].chapter !== chapter.chapter && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => {
                navigationRef.replaceParams({
                  comicId: comicId,
                  chapterId: `chapter_${chapter.chapter + 1}`,
                });
                // navigate next chap later
              }}
            >
              <Text style={styles.title}>Chap {chapter.chapter + 1}</Text>
              <ArrowRight color="#fff" size={14} />
            </TouchableOpacity>
          )}
        </View>

        <Animated.ScrollView
          ref={scrollRef}
          style={styles.scroll}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        >
          {chapter.links.map((img, i) => {
            const size = sizes[i];

            let baseWidth = SCREEN_WIDTH;
            let baseHeight = SCREEN_WIDTH * 1.6;

            if (size) {
              const { w, h } = size;
              const aspect = h / w || 1.6;
              console.log(i, size);
              const scale = Math.min(SCREEN_WIDTH / w, 3);

              baseWidth = w * scale;
              baseHeight = baseWidth * aspect;
            }

            const uri = toDirectDriveUrl(img);
            return (
              <Zoomable
                key={img + i}
                minScale={1}
                maxScale={4}
                doubleTapScale={2.5}
                style={{
                  width: baseWidth,
                  height: baseHeight,
                  alignSelf: 'center',
                }}
              >
                <TurboImage
                  source={{ uri }}
                  style={{
                    width: baseWidth,
                    height: baseHeight,
                    backgroundColor: '#111',
                  }}
                  isProgressiveImageRenderingEnabled
                  resizeMode="contain"
                />
              </Zoomable>
            );
          })}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              — Hết chap {chapter.chapter} —
            </Text>
          </View>
        </Animated.ScrollView>
        <AdsBanner />
        {scrollUpVisible && (
          <TouchableOpacity style={styles.scrollTopBtn} onPress={scrollToTop}>
            <ChevronUp color="black" size={22} />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
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
    bottom: 120,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
    zIndex: 999,
  },
});
