import Header from '@/components/header';
import SearchModal from '@/components/search-modal';
import { copyPostCaption, getTrendingPosts, reactToEmotionPost } from '@/services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CaptionItem {
  id: string;
  author: string;
  timeAgo: string;
  badge?: string;
  content: string;
  likes: number;
  copies: number;
  userLiked?: boolean;
  tags?: string;
  styleType?: 'minimal' | 'serif-accent';
}

const HERO_QUOTE = {
  id: 'hero-qod',
  badge: 'QUOTE OF THE DAY',
  author: '@an_nhien',
  quote:
    'Đôi khi điều đẹp nhất không phải là gặp được ai đó, mà là tìm lại chính mình sau chuỗi ngày lạc lõng.',
  score: '1.8k',
  copies: '3.4k',
};

const CURATED_COLLECTIONS = [
  {
    id: 'col-1',
    emoji: '🌧️',
    subtitle: 'Cho ngày mưa',
    title: 'Những câu chữ dành cho ngày mưa',
    count: '128 câu',
    gradient: ['#0f172a', '#1e1b4b'] as const,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  {
    id: 'col-2',
    emoji: '☕',
    subtitle: 'Trạm dừng chân',
    title: 'Bình yên thôi cũng đã đủ',
    count: '94 câu',
    gradient: ['#1c1917', '#451a03'] as const,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  {
    id: 'col-3',
    emoji: '🚀',
    subtitle: 'Khát vọng',
    title: 'Tuổi trẻ và những ngã rẽ',
    count: '210 câu',
    gradient: ['#1c1917', '#4c0519'] as const,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  {
    id: 'col-4',
    emoji: '🌙',
    subtitle: 'Về đêm',
    title: 'Nỗi nhớ không tên giữa bốn bức tường',
    count: '165 câu',
    gradient: ['#1e1b4b', '#2e1065'] as const,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
];

const INITIAL_TRENDING_ITEMS: CaptionItem[] = [
  {
    id: 'c-1',
    author: '@tiem_ca_phe_mua',
    timeAgo: '2h trước',
    badge: '#2 Trending 🔥',
    content:
      'Tuổi trẻ không cần phải luôn rực rỡ, chỉ cần đủ can đảm để sống theo cách mình muốn và không hối tiếc vì những điều chưa dám làm.',
    likes: 512,
    copies: 924,
    userLiked: false,
    styleType: 'minimal',
  },
  {
    id: 'c-2',
    author: '@mưa_đêm',
    timeAgo: '4h trước',
    badge: 'Gợi Ý Triết Lý',
    content:
      'Có những ngày lặng lẽ đến mức tiếng mưa rơi ngoài hiên cũng hóa thành lời an ủi dịu dàng nhất.',
    likes: 389,
    copies: 640,
    tags: 'Mưa • Bình yên',
    userLiked: false,
    styleType: 'serif-accent',
  },
  {
    id: 'c-3',
    author: '@saigon_night',
    timeAgo: '5h trước',
    badge: '#4 Trending',
    content:
      'Sài Gòn hoa lệ, hoa cho người giàu và lệ cho người đau đáu về những ước mơ còn dang dở.',
    likes: 672,
    copies: 1120,
    userLiked: false,
    styleType: 'minimal',
  },
  {
    id: 'c-4',
    author: '@tiem_tho_nho',
    timeAgo: '6h trước',
    badge: '#5 Trending',
    content:
      'Mỗi vết thương đều để lại một bài học, và mỗi bài học đều làm cho tâm hồn bạn sâu sắc hơn.',
    likes: 428,
    copies: 810,
    userLiked: false,
    styleType: 'minimal',
  },
];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [trendingList, setTrendingList] = useState<CaptionItem[]>(INITIAL_TRENDING_ITEMS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastOpacity = useState(new Animated.Value(0))[0];

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(null));
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await Clipboard.setStringAsync(`${text} #EmotionCare`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopiedId(id);
      showToast('Đã lưu caption vào bộ nhớ tạm kèm #EmotionCare! ✨');
      setTimeout(() => setCopiedId(null), 2000);

      // Increment local count and sync with backend if valid ID
      setTrendingList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, copies: item.copies + 1 } : item))
      );
      if (!id.startsWith('hero') && !id.startsWith('c-')) {
        copyPostCaption(id);
      }
    } catch {
      showToast('Đã lưu nội dung!');
    }
  };

  const handleToggleLike = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTrendingList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextLiked = !item.userLiked;
          if (nextLiked) {
            showToast('Đã gửi đồng cảm ấm áp 🫂');
          }
          return {
            ...item,
            userLiked: nextLiked,
            likes: nextLiked ? item.likes + 1 : Math.max(0, item.likes - 1),
          };
        }
        return item;
      })
    );

    if (!id.startsWith('c-')) {
      reactToEmotionPost(id, 1);
    }
  };

  const handleOpenStudioWithText = (text: string) => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/(tabs)/write',
      params: { prefillText: text },
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await getTrendingPosts(0, 10);
      const data = (res?.data as any)?.data?.content || (res?.data as any)?.content;
      if (Array.isArray(data) && data.length > 0) {
        const mapped: CaptionItem[] = data.map((item: any, idx: number) => ({
          id: item.id,
          author: item.author_alias || 'Ai đó ẩn danh',
          timeAgo: 'Vừa xong',
          badge: `#${idx + 1} Trending 🔥`,
          content: item.content,
          likes: item.total_reactions || 12,
          copies: item.copy_count || 34,
          userLiked: !!item.user_reaction_id,
          styleType: idx % 2 === 0 ? 'minimal' : 'serif-accent',
        }));
        setTrendingList(mapped);
      }
    } catch {
      // keep curated items
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        eyebrow="KHÁM PHÁ HÔM NAY"
        title="Words Matter"
        onOpenSearch={() => setIsSearchOpen(true)}
        onShowToast={showToast}
      />

      {/* Floating Micro-Toast Overlay */}
      {toastMessage && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <Text style={styles.toastEmoji}>✨</Text>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#C084FC"
            colors={['#C084FC']}
          />
        }
      >
        {/* ================= HYBRID MASTER ARCHITECTURE ================= */}
        <View style={styles.conceptWrapper}>
          {/* 1. Hero Editorial Quote of the Day (Bìa Tạp Chí Tương Tác) */}
          <LinearGradient
            colors={['rgba(88, 28, 135, 0.35)', 'rgba(15, 23, 42, 0.85)', 'rgba(15, 23, 42, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroQuoteCard}
          >
            <View style={styles.heroQuoteTopRow}>
              <View style={styles.quoteBadgePill}>
                <Text style={styles.quoteBadgeText}>{HERO_QUOTE.badge}</Text>
              </View>
              <Text style={styles.heroAuthorText}>Bởi {HERO_QUOTE.author}</Text>
            </View>

            <Text style={styles.heroQuoteText}>"{HERO_QUOTE.quote}"</Text>

            <View style={styles.heroQuoteBottomRow}>
              <View style={styles.heroScoreInfo}>
                <Ionicons name="star" size={13} color="#FBBF24" />
                <Text style={styles.heroScoreText}>Score {HERO_QUOTE.score}</Text>
                <Text style={styles.heroDotText}>•</Text>
                <Text style={styles.heroCopiesText}>{HERO_QUOTE.copies} copy</Text>
              </View>

              {/* 1-Tap Copy Action */}
              <TouchableOpacity
                style={[
                  styles.oneTapCopyBtn,
                  copiedId === HERO_QUOTE.id && styles.oneTapCopyBtnSuccess,
                ]}
                onPress={() => handleCopy(HERO_QUOTE.id, HERO_QUOTE.quote)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={copiedId === HERO_QUOTE.id ? 'checkmark' : 'copy'}
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={styles.oneTapCopyBtnText}>
                  {copiedId === HERO_QUOTE.id ? '✓ Đã chép' : '1-Tap Copy'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* 2. Curated Editorial Collections (Băng chuyền Tuyển tập nghệ thuật) */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>TUYỂN TẬP BIÊN TẬP</Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/explore')}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionHeaderLink}>Xem tất cả ➔</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalCollectionsRow}
            >
              {CURATED_COLLECTIONS.map((col) => (
                <TouchableOpacity
                  key={col.id}
                  style={[styles.collectionCard, { borderColor: col.borderColor }]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push({
                      pathname: '/(tabs)/explore',
                      params: { collectionTitle: col.title },
                    });
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={col.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.collectionGradientInner}
                  >
                    <View style={styles.collectionCardTop}>
                      <Text style={styles.collectionEmoji}>{col.emoji}</Text>
                      <View style={styles.collectionCountPill}>
                        <Text style={styles.collectionCountText}>{col.count}</Text>
                      </View>
                    </View>
                    <View style={styles.collectionCardBottom}>
                      <Text style={styles.collectionSubtitle}>{col.subtitle}</Text>
                      <Text style={styles.collectionTitle}>{col.title}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 3. Trending Caption Stream (Rhythmic Card Feed) */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>TRENDING NOW • BẢNG XẾP HẠNG</Text>
              <View style={styles.liveGravityIndicator}>
                <View style={styles.liveGreenDot} />
                <Text style={styles.liveGravityText}>Live Gravity Score</Text>
              </View>
            </View>

            <View style={styles.streamStack}>
              {trendingList.map((item) => {
                const isCopied = copiedId === item.id;
                if (item.styleType === 'serif-accent') {
                  return (
                    <View key={item.id} style={styles.serifAccentCard}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.serifAccentBadge}>{item.badge}</Text>
                        <TouchableOpacity
                          onPress={() => handleOpenStudioWithText(item.content)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.editInStudioLink}>Edit trong Studio ✎</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.serifAccentQuoteWrap}>
                        <Text style={styles.serifAccentQuoteText}>"{item.content}"</Text>
                      </View>

                      <View style={styles.cardFooterRow}>
                        <Text style={styles.cardTagText}>{item.tags || 'Bình yên'}</Text>
                        <TouchableOpacity
                          style={[styles.indigoCopyBtn, isCopied && styles.oneTapCopyBtnSuccess]}
                          onPress={() => handleCopy(item.id, item.content)}
                          activeOpacity={0.85}
                        >
                          <Ionicons
                            name={isCopied ? 'checkmark' : 'copy'}
                            size={13}
                            color="#FFFFFF"
                          />
                          <Text style={styles.indigoCopyBtnText}>
                            {isCopied ? '✓ Đã chép' : '1-Tap Copy'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }

                // Default Minimalist Typography Card
                return (
                  <View key={item.id} style={styles.minimalCard}>
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.authorBadgeRow}>
                        <View style={styles.authorAmberDot} />
                        <Text style={styles.authorNameText}>{item.author}</Text>
                        <Text style={styles.timeAgoText}>• {item.timeAgo}</Text>
                      </View>
                      {item.badge ? (
                        <View style={styles.trendingRankPill}>
                          <Text style={styles.trendingRankText}>{item.badge}</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.minimalContentText}>"{item.content}"</Text>

                    <View style={styles.cardFooterRow}>
                      <View style={styles.reactionsInfoRow}>
                        <TouchableOpacity
                          style={styles.reactionTouch}
                          onPress={() => handleToggleLike(item.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.reactionEmojiText}>🫂</Text>
                          <Text
                            style={[
                              styles.reactionCountNum,
                              item.userLiked && styles.reactionCountLiked,
                            ]}
                          >
                            {item.likes}
                          </Text>
                        </TouchableOpacity>

                        <View style={styles.copyCountInfo}>
                          <Ionicons name="copy-outline" size={14} color="#C084FC" />
                          <Text style={styles.copyCountNum}>{item.copies}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[styles.smallCopyBtn, isCopied && styles.oneTapCopyBtnSuccess]}
                        onPress={() => handleCopy(item.id, item.content)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={isCopied ? 'checkmark' : 'copy'}
                          size={12}
                          color="#FFFFFF"
                        />
                        <Text style={styles.smallCopyBtnText}>
                          {isCopied ? '✓ Đã chép' : 'Copy'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Search Modal (k-NN Vector Search) - Tự đóng khi bấm ra ngoài, không cần nút Đóng */}
      <SearchModal
        visible={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTag={(tag) => showToast(`Tìm kiếm theo tag: ${tag}`)}
        onSearchSubmit={(q) => showToast(`Đang tìm kiếm k-NN cho: "${q}"`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08090C',
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  toastEmoji: {
    fontSize: 14,
  },
  toastText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    gap: 16,
  },
  conceptWrapper: {
    gap: 16,
  },
  heroQuoteCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 6,
  },
  heroQuoteTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quoteBadgePill: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
  },
  quoteBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D8B4FE',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  heroAuthorText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  heroQuoteText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#F8FAFC',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  heroQuoteBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroScoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroScoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FDE047',
  },
  heroDotText: {
    fontSize: 11,
    color: '#64748B',
  },
  heroCopiesText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  oneTapCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#9333EA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  oneTapCopyBtnSuccess: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
  },
  oneTapCopyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionHeaderLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C084FC',
  },
  horizontalCollectionsRow: {
    gap: 12,
    paddingVertical: 4,
  },
  collectionCard: {
    width: 170,
    height: 190,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  collectionGradientInner: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  collectionCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  collectionEmoji: {
    fontSize: 24,
  },
  collectionCountPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  collectionCountText: {
    fontSize: 9,
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  collectionCardBottom: {
    gap: 3,
  },
  collectionSubtitle: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#93C5FD',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  collectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  liveGravityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  liveGravityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
    fontFamily: 'monospace',
  },
  streamStack: {
    gap: 12,
  },
  minimalCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 16,
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorAmberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FBBF24',
  },
  authorNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  timeAgoText: {
    fontSize: 10,
    color: '#64748B',
  },
  trendingRankPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  trendingRankText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FBBF24',
  },
  minimalContentText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#F1F5F9',
    letterSpacing: 0.1,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  reactionsInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  reactionTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reactionEmojiText: {
    fontSize: 15,
  },
  reactionCountNum: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  reactionCountLiked: {
    color: '#C084FC',
    fontWeight: '800',
  },
  copyCountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  copyCountNum: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  smallCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  smallCopyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  serifAccentCard: {
    backgroundColor: '#0E1017',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    padding: 16,
    gap: 10,
  },
  serifAccentBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A5B4FC',
  },
  editInStudioLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C084FC',
  },
  serifAccentQuoteWrap: {
    borderLeftWidth: 3,
    borderLeftColor: '#818CF8',
    paddingLeft: 12,
    marginVertical: 4,
  },
  serifAccentQuoteText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#F8FAFC',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  cardTagText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  indigoCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  indigoCopyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
