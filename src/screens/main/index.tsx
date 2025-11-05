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

const comics = [
  {
    id: '1',
    name: 'Đại Quản Gia Là Ma Hoàng',
    author: 'Yi Nan',
    description:
      'Ma hoàng chuyển sinh thành quản gia — hành trình vừa hài hước vừa bi tráng!',
    banner:
      'https://static.sach.chat/sachchat-image/original-cover1704603733666-blob.jpg',
    rating: 4.9,
    views: 520000,
    status: 'Đang ra',
    tags: ['Fantasy', 'Action', 'Hài Hước'],
  },
  {
    id: '2',
    name: 'Toàn Chức Pháp Sư',
    author: 'Chaos',
    description:
      'Một học sinh bình thường thức tỉnh thành pháp sư mạnh nhất thế giới.',
    banner:
      'https://thuvienanime.net/wp-content/uploads/2023/04/toan-chuc-phap-su-thuvienanime-1.jpg',
    rating: 4.8,
    views: 720000,
    status: 'Hoàn thành',
    tags: ['Magic', 'Adventure', 'School Life'],
  },
  {
    id: '3',
    name: 'Solo Leveling',
    author: 'Chu-Gong',
    description: 'Từ thợ săn yếu nhất trở thành người mạnh nhất nhân loại.',
    banner:
      'https://static2.vieon.vn/vieplay-image/poster_v4/2025/09/26/ehgrj4hj_660x946-chuyensinhthathoangtu-s2.png',
    rating: 4.9,
    views: 1200000,
    status: 'Hoàn thành',
    tags: ['Action', 'Fantasy'],
  },
];
const categories = [
  'Tất cả',
  'Action',
  'Fantasy',
  'Hài Hước',
  'Magic',
  'Adventure',
];

const MainScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const comics = useComicStore(state => state.comics);
  const updateComics = useComicStore(state => state.updateComic);
  const updateBookMarkComic = useComicBookMarkStore(
    state => state.updateBookMarkComic,
  );
  const bookmarkedComics = useComicBookMarkStore(state => state.comics);

  const [activeTab, setActiveTab] = useState<'all' | 'followed'>('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('Mới nhất');

  const toggleFollow = (comic: TComic) => {
    updateBookMarkComic(comic);
  };

  const filtered = useMemo(() => {
    let list = (activeTab === 'all' ? comics : bookmarkedComics).filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()),
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
      const isBookMarked = bookmarkedComics.find(item => item.id === comic.id);
      return (
        <TouchableOpacity
          key={comic.id}
          style={styles.card}
          onPress={() =>
            navigationRef.navigate('ComicDetail', {
              id: comic.id,
            })
          }
        >
          <Image source={{ uri: comic.banner }} style={styles.cover} />
          <View style={styles.info}>
            <Text style={styles.name}>{comic.name}</Text>
            <Text style={styles.author}>👤 {comic.author}</Text>
            <Text style={styles.desc} numberOfLines={2}>
              {comic.description}
            </Text>
            <View style={styles.meta}>
              <Text style={styles.tag}>⭐ {comic.ratings}</Text>
              <Text style={styles.tag}>👁 {comic.views.toLocaleString()}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.followButton}
            onPress={() => toggleFollow(comic)}
          >
            {isBookMarked ? (
              <Heart fill="#ff4444" color="#ff4444" size={22} />
            ) : (
              <HeartOff color="#aaa" size={22} />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [bookmarkedComics, comics],
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
            <FlatList data={filtered} renderItem={renderComicItem} />
          )}
        </View>
      )}
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
  list: { paddingHorizontal: 16, marginTop: 8 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 8,
    marginBottom: 12,
    position: 'relative',
  },
  cover: { width: 100, height: 120, borderRadius: 8 },
  info: { flex: 1, marginLeft: 10 },
  name: { color: '#fff', fontWeight: '700', fontSize: 16 },
  author: { color: '#aaa', marginVertical: 2 },
  desc: { color: '#ccc', fontSize: 13 },
  meta: { flexDirection: 'row', gap: 10, marginTop: 6 },
  tag: { color: '#ffcc00', fontSize: 13 },
  followButton: { position: 'absolute', top: 10, right: 10 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 30 },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});
