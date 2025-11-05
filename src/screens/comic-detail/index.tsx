import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import {
  Heart,
  Eye,
  Star,
  BookOpen,
  Search,
  ArrowLeft,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { navigationRef } from '@src/navigations';

const ComicDetailScreen = ({ route, navigation }: any) => {
  const comic = route?.params?.comic ?? {
    id: '1',
    name: 'Đại Quản Gia Là Ma Hoàng',
    author: 'Yi Nan',
    description:
      'Ma hoàng chuyển sinh thành quản gia — hành trình vừa hài hước vừa bi tráng! Một câu chuyện hấp dẫn về sức mạnh, lòng trung thành và những âm mưu trong thế giới tu tiên.',
    banner:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs7eXbvIaCJJSW6a5NGrVCae1vbz4eQQdw3g&s',
    rating: 4.9,
    views: 520000,
    status: 'Đang ra',
    tags: ['Fantasy', 'Action', 'Hài Hước'],
  };

  const chapters = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Chap ${i + 1}`,
    date: `Cập nhật ${20 - i} ngày trước`,
  }));

  const [isFollowed, setIsFollowed] = useState(false);
  const [search, setSearch] = useState('');

  const filteredChapters = useMemo(() => {
    if (!search) return chapters;
    return chapters.filter(ch =>
      ch.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, chapters]);

  return (
    <SafeAreaView style={styles.container}>
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
              <Text style={styles.comicName} numberOfLines={2}>
                {comic.name}
              </Text>
              <Text style={styles.authorText}>👤 {comic.author}</Text>

              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Star size={14} color="#ffcc00" />
                  <Text style={styles.badgeText}>{comic.rating}</Text>
                </View>
                <View style={styles.badge}>
                  <Eye size={14} color="#0af" />
                  <Text style={styles.badgeText}>
                    {comic.views.toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.badge, styles.statusBadge]}>
                  <Text style={[styles.badgeText, { color: '#ff9f3f' }]}>
                    {comic.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Nội dung */}
        <View style={styles.content}>
          <View style={styles.tagsContainer}>
            {comic.tags.map((tag: any) => (
              <Text key={tag} style={styles.tagChip}>
                #{tag}
              </Text>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.desc}>{comic.description}</Text>

          {/* Nút hành động */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.readButton}>
              <BookOpen size={18} color="#fff" />
              <Text style={styles.readButtonText}>Đọc từ đầu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowed && { borderColor: '#ff4444' },
              ]}
              onPress={() => setIsFollowed(!isFollowed)}
            >
              <Heart
                size={18}
                color={isFollowed ? '#ff4444' : '#ddd'}
                fill={isFollowed ? '#ff4444' : 'none'}
              />
              <Text
                style={[
                  styles.followText,
                  { color: isFollowed ? '#ff4444' : '#ddd' },
                ]}
              >
                {isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Ô tìm kiếm chương */}
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

          {/* Danh sách chương */}
          <Text style={styles.sectionTitle}>Danh sách chương</Text>
          <View style={styles.chapterList}>
            {filteredChapters.length === 0 ? (
              <Text
                style={{ color: '#888', textAlign: 'center', marginTop: 10 }}
              >
                Không tìm thấy chương nào
              </Text>
            ) : (
              filteredChapters.map(ch => (
                <TouchableOpacity
                  key={ch.id}
                  style={styles.chapterItem}
                  onPress={() => navigationRef.navigate('ComicReader')}
                >
                  <View>
                    <Text style={styles.chapterName}>{ch.name}</Text>
                    <Text style={styles.chapterDate}>{ch.date}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
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
  content: { marginTop: 56, paddingHorizontal: 16, paddingBottom: 32 },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    fontSize: 12,
    color: '#ddd',
    backgroundColor: '#1b1b1f',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    marginTop: 12,
  },
  desc: { color: '#cfcfcf', fontSize: 14, lineHeight: 20 },
  buttonRow: { flexDirection: 'row', marginTop: 18, gap: 10 },
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
  divider: { height: 1, backgroundColor: '#1b1b1f', marginVertical: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  chapterList: { marginTop: 4 },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#1b1b1f',
    borderBottomWidth: 1,
  },
  chapterName: { color: '#fff', fontSize: 15, marginBottom: 2 },
  chapterDate: { color: '#888', fontSize: 12 },
});
