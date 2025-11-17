import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image as RNImage,
  FlatList,
} from 'react-native';
import { ArrowLeft, ArrowRight, ChevronUp } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TurboImage from 'react-native-turbo-image';
import { useComicStore } from '@src/zustand/useComicStore';
import { navigationRef } from '@src/navigations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeInAppReview from 'react-native-in-app-review';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_ASPECT = 1.6;
const PREFETCH_AHEAD = 5;

function toDirectDriveUrl(rawUrl: string) {
  const m1 = rawUrl.match(/\/d\/([^/]+)/);
  const m2 = rawUrl.match(/[?&]id=([^&]+)/);
  const fileId = m1?.[1] ?? m2?.[1];
  if (!fileId) return rawUrl;
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

type Size = { w: number; h: number };

const ComicReaderScreen = ({ route, navigation }: any) => {
  const { comicId, chapterId } = route.params as {
    comicId: string;
    chapterId: string;
  };

  const getComic = useComicStore(state => state.getComic);
  const getChapter = useComicStore(state => state.getChapter);

  const comic = getComic(comicId);
  const chapter = getChapter(comicId, chapterId);

  const scrollRef = useRef<FlatList<string> | null>(null);
  const [scrollUpVisible, setScrollUpVisible] = useState(false);
  const [sizes, setSizes] = useState<Record<string, Size>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > 300 && !scrollUpVisible) setScrollUpVisible(true);
    else if (y <= 300 && scrollUpVisible) setScrollUpVisible(false);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (!viewableItems.length) return;
      const indices = viewableItems
        .map(v => v.index)
        .filter((i): i is number => i !== null && i !== undefined);
      if (!indices.length) return;
      const minIndex = Math.min(...indices);
      setCurrentIndex(minIndex);
    },
  ).current;

  useEffect(() => {
    if (!chapter) return;

    const links = chapter.links;
    const targets: number[] = [];

    for (let i = currentIndex; i <= currentIndex + PREFETCH_AHEAD; i += 1) {
      targets.push(i);
    }

    targets.forEach(index => {
      if (index < 0 || index >= links.length) return;

      const uri = toDirectDriveUrl(links[index]);
      if (sizes[uri]) return;

      TurboImage.prefetch([{ uri }]).catch(() => {});

      RNImage.getSize(
        uri,
        (w, h) => {
          setSizes(prev => (prev[uri] ? prev : { ...prev, [uri]: { w, h } }));
        },
        () => {
          setSizes(prev =>
            prev[uri]
              ? prev
              : {
                  ...prev,
                  [uri]: {
                    w: SCREEN_WIDTH,
                    h: SCREEN_WIDTH * DEFAULT_ASPECT,
                  },
                },
          );
        },
      );
    });
  }, [chapter, currentIndex, sizes]);

  useEffect(() => {
    return () => {
      TurboImage.clearMemoryCache();
      TurboImage.clearDiskCache();
    };
  }, []);
  if (!comic || !chapter) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.notFoundWrapper}>
          <Text style={styles.notFoundText}>
            Không tìm thấy truyện hoặc chương
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.notFoundBack}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasNextChapter =
    comic.chapters?.length &&
    comic.chapters.some(c => c.chapter === chapter.chapter + 1);

  const nextChapterId = `chapter_${chapter.chapter + 1}`;

  const renderItem = ({ item }: { item: string }) => {
    const uri = toDirectDriveUrl(item);
    const size = sizes[uri];

    const w = size?.w ?? SCREEN_WIDTH;
    const h = size?.h ?? SCREEN_WIDTH * DEFAULT_ASPECT;
    const aspect = h / w || DEFAULT_ASPECT;

    const displayWidth = SCREEN_WIDTH;
    const displayHeight = displayWidth * aspect;

    return (
      <TurboImage
        source={{ uri }}
        style={{
          width: displayWidth,
          height: displayHeight,
          backgroundColor: '#111',
        }}
        indicator={{ color: 'white' }}
        placeholder={{ memoryCacheKey: uri }}
        showPlaceholderOnFailure
        isProgressiveImageRenderingEnabled
        resizeMode="contain"
      />
    );
  };
  const askReview = async () => {
    const reviewed = await AsyncStorage.getItem('has_reviewed');
    if (reviewed) return;

    if (ReactNativeInAppReview.isAvailable()) {
      try {
        await ReactNativeInAppReview.RequestInAppReview();
        await AsyncStorage.setItem('has_reviewed', '1');
      } catch {}
    }
  };
  useEffect(() => {
    setTimeout(() => {
      askReview();
    }, 30000);
  }, []);

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
          {hasNextChapter && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => {
                navigationRef.replaceParams({
                  comicId,
                  chapterId: nextChapterId,
                });
              }}
            >
              <Text style={styles.title}>Chap {chapter.chapter + 1}</Text>
              <ArrowRight color="#fff" size={14} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          ref={scrollRef}
          data={chapter.links}
          keyExtractor={(item, index) => item + index}
          renderItem={renderItem}
          style={styles.scroll}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          windowSize={7}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                — Hết chap {chapter.chapter} —
              </Text>
            </View>
          }
        />

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
  headerContent: { flex: 1 },
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
  notFoundWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { color: '#fff', marginBottom: 12 },
  notFoundBack: { color: '#ff5b00' },
});
