import React, { useState, useMemo, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {
  Heart,
  Eye,
  Star,
  BookOpen,
  Search,
  ArrowLeft,
  ArrowDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { navigationRef } from '@src/navigations';
import firestore from '@react-native-firebase/firestore';
import { useComicStore } from '@src/zustand/useComicStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TAppNavigationParam } from '@src/utils/types/navigation.types';
import { TChapter } from '@src/utils/types/comic.types';
import { useComicBookMarkStore } from '@src/zustand/useComicBookMarkStore';
import { useComicReadStore } from '@src/zustand/useComicReadStore';

type Props = NativeStackScreenProps<TAppNavigationParam, 'ComicDetail'>;

const ComicDetailScreen = ({ route, navigation }: Props) => {
  const comic = useComicStore(state => state.getComic(route.params.id));
  const comicReads = useComicReadStore(state => state.comics);
  const updateChapterRead = useComicReadStore(state => state.updateReadComic);
  const updateComicChapter = useComicStore(state => state.updateComicChapter);
  const updateBookMarkComic = useComicBookMarkStore(
    state => state.updateBookMarkComic,
  );
  const bookmarkedComicIds = useComicBookMarkStore(state => state.comics);

  const isCheckBookMark = useMemo(
    () => bookmarkedComicIds.find(item => item === comic?.id),
    [bookmarkedComicIds, comic],
  );
  const [search, setSearch] = useState('');
  const [isViewMore, setIsViewMore] = useState(false);
  useEffect(() => {
    if (!comic?.id) return;

    const unsubscribe = firestore()
      .collection('comics')
      .doc(comic.id)
      .collection('chapters')
      .orderBy('chapter', 'desc')
      .onSnapshot(
        snapshot => {
          const data: TChapter[] = snapshot.docs.map(doc => {
            const d = doc.data() as TChapter;
            return {
              id: doc.id,
              chapter: d.chapter,
              createdAt: new Date(d.createdAt),
              count: d.count || 0,
              links: d.links || [],
            };
          });
          console.log('Chapter', data);
          updateComicChapter(comic.id, data);
        },
        error => {
          console.error('Error loading chapters:', error);
        },
      );

    return unsubscribe;
  }, [comic?.id]);

  const filteredChapters = useMemo(() => {
    if (!search) return comic?.chapters;
    return comic?.chapters?.filter(ch =>
      `chap ${ch.chapter}`.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, comic?.chapters]);
  if (!comic) return <View />;
  console.log(comic);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.headerArea}>
          <Image source={{ uri: comic.banner }} style={styles.bannerImage} />
          <View style={styles.bannerOverlay} />

          {/* Nút trở lại */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft color="#fff" size={22} />
          </TouchableOpacity>

          <View style={styles.posterWrapper}>
            <Image source={{ uri: comic.banner }} style={styles.poster} />
            <View style={styles.posterInfo}>
              <View>
                <Text style={styles.comicName} numberOfLines={2}>
                  {comic.name}
                </Text>
                <Text style={styles.authorText}>👤 {comic.author}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <Star size={14} color="#ffcc00" />
                    <Text style={styles.badgeText}>{comic.ratings}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Eye size={14} color="#0af" />
                    <Text style={styles.badgeText}>
                      {comic.views.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.tagsContainer}>
                {comic.hash_tags?.map((tag: any) => (
                  <Text key={tag} style={styles.tagChip}>
                    #{tag}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Nội dung */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.desc} numberOfLines={isViewMore ? undefined : 4}>
            {comic.description}
          </Text>
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => setIsViewMore(!isViewMore)}
          >
            <Text style={styles.viewMore}>
              {isViewMore ? 'Rút gọn' : 'Xem thêm'}
            </Text>
            {isViewMore ? (
              <ChevronUp color={'white'} size={14} />
            ) : (
              <ChevronDown color={'white'} size={14} />
            )}
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.readButton}
              onPress={() => {
                if (comic?.chapters.length > 0) {
                  const lastChapter =
                    comic?.chapters[comic?.chapters.length - 1];
                  navigationRef.navigate('ComicReader', {
                    comicId: comic.id,
                    chapterId: lastChapter.id,
                  });
                }
              }}
            >
              <BookOpen size={18} color="#fff" />
              <Text style={styles.readButtonText}>Đọc từ đầu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.followButton,
                isCheckBookMark && { borderColor: '#ff4444' },
              ]}
              onPress={() => updateBookMarkComic(comic.id)}
            >
              <Heart
                size={18}
                color={isCheckBookMark ? '#ff4444' : '#ddd'}
                fill={isCheckBookMark ? '#ff4444' : 'none'}
              />
              <Text
                style={[
                  styles.followText,
                  { color: isCheckBookMark ? '#ff4444' : '#ddd' },
                ]}
              >
                {isCheckBookMark ? 'Đang theo dõi' : 'Theo dõi'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          <View style={styles.searchContainer}>
            <Search color="#888" size={18} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm chương..."
              placeholderTextColor="#777"
              style={styles.searchInput}
            />
          </View>

          <Text style={styles.sectionTitle}>Danh sách chương</Text>
          <View style={styles.chapterList}>
            {filteredChapters?.length === 0 ? (
              <Text
                style={{ color: '#888', textAlign: 'center', marginTop: 10 }}
              >
                Không tìm thấy chương nào
              </Text>
            ) : (
              filteredChapters?.map((ch, index) => {
                const isRead = comicReads
                  .find(item => item.id === comic.id)
                  ?.chapterIds?.includes(ch.id);
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.chapterItem}
                    onPress={() => {
                      updateChapterRead(comic.id, ch.id);
                      navigationRef.navigate('ComicReader', {
                        comicId: comic.id,
                        chapterId: ch.id,
                      });
                    }}
                  >
                    <View>
                      <Text
                        style={styles.chapterName}
                      >{`Chap ${ch.chapter}`}</Text>
                      <Text style={styles.chapterDate}>
                        {ch.createdAt
                          ? `Cập nhật ${ch.createdAt.toLocaleDateString(
                              'vi-VN',
                            )}`
                          : ''}
                      </Text>
                    </View>
                    <View style={styles.chapterRightSection}>
                      {isRead && <Star size={14} color="#ffcc00" />}
                      <Text style={{ color: '#888', fontSize: 12 }}>
                        {ch.count} trang
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
      {/* <AdsInterstitial /> */}
    </SafeAreaView>
  );
};

export default ComicDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050509' },
  headerArea: { width: '100%', height: 260, position: 'relative' },
  bannerImage: { width: '100%', height: '100%', opacity: 0.6 },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 999,
    padding: 6,
  },
  posterWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: -40,
    flexDirection: 'row',
  },
  poster: {
    width: 110,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#222',
  },
  posterInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  comicName: { color: '#fff', fontSize: 22, fontWeight: '700' },
  authorText: { color: '#aaa', fontSize: 13, marginTop: 4 },
  badgeRow: { flexDirection: 'row', marginTop: 10, gap: 8, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  statusBadge: { borderWidth: 1, borderColor: '#ff9f3f' },
  badgeText: { color: '#ddd', fontSize: 12 },
  content: { marginTop: 56, paddingBottom: 32 },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    marginTop: 5,
  },
  tagChip: {
    fontSize: 12,
    color: '#ddd',
    backgroundColor: '#1b1b1f',
    paddingHorizontal: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 999,
    height: 25,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  desc: {
    color: '#cfcfcf',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 10,
    paddingHorizontal: 16,
  },
  readButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ff5b00',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  readButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  followText: { fontWeight: '600', fontSize: 14 },
  divider: {
    height: 1,
    backgroundColor: '#1b1b1f',
    marginTop: 8,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  chapterList: { marginTop: 4, paddingHorizontal: 16 },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#1b1b1f',
    borderBottomWidth: 1,
  },
  chapterRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chapterName: { color: '#fff', fontSize: 15, marginBottom: 2 },
  chapterDate: { color: '#888', fontSize: 12 },
  viewMoreButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewMore: {
    color: 'white',
    fontSize: 14,
  },
});
