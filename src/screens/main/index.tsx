import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ListRenderItemInfo,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Heart, HeartOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabHeader from './components/TabHeader';
import { navigationRef } from '@src/navigations';
import firestore from '@react-native-firebase/firestore';
import { useComicStore } from '@src/zustand/useComicStore';
import { TComic } from '@src/utils/types/comic.types';
import { useComicBookMarkStore } from '@src/zustand/useComicBookMarkStore';
import AdsBanner from '@src/components/AdsBanner';

const MainScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const comics = useComicStore(state => state.comics);
  const updateComics = useComicStore(state => state.updateComic);
  const updateBookMarkComic = useComicBookMarkStore(
    state => state.updateBookMarkComic,
  );
  const bookmarkedComics = useComicBookMarkStore(state => state.comics);
  const categories = useMemo(() => {
    const allTags = comics.flatMap(item => item.hash_tags || []);
    return ['Tất cả', ...Array.from(new Set(allTags))];
  }, [comics]);
  const [activeTab, setActiveTab] = useState<'all' | 'followed'>('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('Mới nhất');

  const toggleFollow = (comic: TComic) => {
    updateBookMarkComic(comic);
  };

  const filtered = useMemo(() => {
    let list = (activeTab === 'all' ? comics : bookmarkedComics).filter(
      c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.author.toLowerCase().includes(search.toLowerCase()),
    );
    if (category !== 'Tất cả')
      list = list.filter(c => c.hash_tags.includes(category));

    switch (sortBy) {
      case 'Xem nhiều':
        return [...list].sort((a, b) => b.views - a.views);
      case 'Đánh giá cao':
        return [...list].sort((a, b) => b.ratings - a.ratings);
      default:
        return list;
    }
  }, [comics, bookmarkedComics, search, category, sortBy, activeTab]);
  const renderComicItem = useCallback(
    ({ item: comic }: ListRenderItemInfo<TComic>) => {
      const isBookMarked = !!bookmarkedComics.find(
        item => item.id === comic.id,
      );

      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigationRef.navigate('ComicDetail', {
              id: comic.id,
            })
          }
          activeOpacity={0.8}
        >
          <View style={styles.coverWrapper}>
            <Image source={{ uri: comic.banner }} style={styles.cover} />
            <View style={styles.coverOverlay} />

            <View style={styles.badgeRow}>
              <Text style={styles.badgeText}>⭐ {comic.ratings}</Text>
              <Text style={styles.badgeText}>
                👁 {comic.views.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.followButton}
              onPress={() => toggleFollow(comic)}
            >
              {isBookMarked ? (
                <Heart fill="#ff4444" color="#ff4444" size={18} />
              ) : (
                <HeartOff color="#f5f5f5" size={18} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>
              {comic.name}
            </Text>
            <Text style={styles.author} numberOfLines={1}>
              {comic.author}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [bookmarkedComics, toggleFollow],
  );

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = firestore()
      .collection('comics')
      .onSnapshot(
        snapshot => {
          console.log(snapshot.docs);
          const data: TComic[] = snapshot.docs.map(doc => {
            const d = doc.data() as any;
            return {
              id: doc.id,
              ...d,
            };
          });
          updateComics(data);
          setTimeout(() => {
            setIsLoading(false);
          }, 200);
        },
        error => {
          console.error('Error loading comics:', error);
        },
      );

    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>📖 Truyện Online</Text>

      <TabHeader activeTab={activeTab} onSwitch={setActiveTab} />

      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="🔍 Tìm kiếm truyện..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(c => (
            <TouchableOpacity
              key={c}
              style={[
                styles.filterChip,
                category === c && styles.filterChipActive,
              ]}
              onPress={() => setCategory(c)}
            >
              <Text
                style={[
                  styles.filterText,
                  category === c && styles.filterTextActive,
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={'white'} />
        </View>
      ) : (
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>Không có truyện nào phù hợp</Text>
          ) : (
            <FlatList
              data={filtered}
              renderItem={renderComicItem}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      )}
      <View style={styles.gapSpace} />
      <AdsBanner />
    </SafeAreaView>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', paddingTop: 10 },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 16,
    marginBottom: 10,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'relative',
  },
  tabItem: {
    paddingVertical: 8,
  },
  tabText: { color: '#999', fontSize: 16, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  tabIndicator: {
    width: '40%',
    height: 3,
    backgroundColor: '#ff5b00',
    borderRadius: 3,
    position: 'absolute',
    bottom: 0,
  },
  searchBox: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: { color: '#fff', height: 40 },
  filterContainer: { marginTop: 12, marginBottom: 8 },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  filterChipActive: { backgroundColor: '#ff5b00' },
  filterText: { color: '#aaa', fontWeight: '600' },
  filterTextActive: { color: '#fff' },

  list: { flex: 1, paddingHorizontal: 12, marginTop: 8 },
  listContent: {
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  card: {
    flex: 1,
    marginHorizontal: 4,
    maxWidth: '50%',
  },
  coverWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#222',
  },
  cover: {
    aspectRatio: 1,
  },
  coverOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '28%',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  badgeRow: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeText: {
    fontSize: 16,
    color: '#ffeb99',
    fontWeight: '600',
  },
  followButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  info: {
    marginTop: 6,
  },
  name: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  author: {
    color: '#9f9f9f',
    fontSize: 11,
    marginTop: 2,
  },

  emptyText: { color: '#888', textAlign: 'center', marginTop: 30 },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  gapSpace: {
    height: 8,
  },
});
