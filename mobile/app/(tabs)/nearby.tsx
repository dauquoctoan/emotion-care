import Header from '@/components/header';
import SearchModal from '@/components/search-modal';
import { reactToEmotionPost } from '@/services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SafeReaction = 'hug' | 'listen' | 'withYou' | null;

interface NearbyPost {
  id: string;
  emoji: string;
  moodName: string;
  moodColor: string;
  distance: string;
  timeAgo: string;
  content: string;
  selectedReaction: SafeReaction;
  hugCount: number;
  listenCount: number;
}

const NEARBY_POSTS: NearbyPost[] = [
  {
    id: 'nb-1',
    emoji: '☕',
    moodName: 'Mệt Mỏi',
    moodColor: '#A78BFA',
    distance: '0.8 km',
    timeAgo: '18 phút trước',
    content: 'Hôm nay công việc dồn dập đến choáng ngợp, chỉ muốn tắt chuông báo thức và được ngủ một giấc thật sâu.',
    selectedReaction: null,
    hugCount: 14,
    listenCount: 9,
  },
  {
    id: 'nb-2',
    emoji: '🌧️',
    moodName: 'Nặng Lòng',
    moodColor: '#60A5FA',
    distance: '1.2 km',
    timeAgo: '42 phút trước',
    content: 'Cảm giác nhìn mọi người xung quanh ai cũng đang tiến về phía trước, còn bản thân thì cứ mãi loay hoay tại chỗ thật là đáng sợ.',
    selectedReaction: 'hug',
    hugCount: 28,
    listenCount: 16,
  },
  {
    id: 'nb-3',
    emoji: '🌙',
    moodName: 'Cô Đơn',
    moodColor: '#818CF8',
    distance: '2.4 km',
    timeAgo: '1 giờ trước',
    content: 'Thành phố triệu người nhưng đôi lúc tìm một người để nói thật lòng những suy nghĩ trong đầu lại khó đến thế.',
    selectedReaction: null,
    hugCount: 19,
    listenCount: 12,
  },
];

export default function NearbyScreen() {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<NearbyPost[]>(NEARBY_POSTS);
  const [activeMoodFilter, setActiveMoodFilter] = useState<string | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Toast
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
      Animated.delay(1800),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(null));
  };

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast('✨ Đã lưu caption vào bộ nhớ tạm!');
  };

  const handleReaction = async (postId: string, reaction: SafeReaction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isCancel = p.selectedReaction === reaction;
          return {
            ...p,
            selectedReaction: isCancel ? null : reaction,
            hugCount:
              reaction === 'hug'
                ? isCancel
                  ? p.hugCount - 1
                  : p.hugCount + 1
                : p.hugCount,
            listenCount:
              reaction === 'listen'
                ? isCancel
                  ? p.listenCount - 1
                  : p.listenCount + 1
                : p.listenCount,
          };
        }
        return p;
      })
    );

    if (reaction === 'hug') {
      showToast('🤗 Đã gửi cái ôm ấm áp đến người bạn gần đây');
    } else if (reaction === 'listen') {
      showToast('👂 Đã gửi thông điệp lắng nghe');
    }

    try {
      await reactToEmotionPost(postId, reaction === 'hug' ? 1 : 2);
    } catch {
      // offline fallback
    }
  };

  const filteredPosts = activeMoodFilter
    ? posts.filter((p) => p.moodName === activeMoodFilter)
    : posts;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        eyebrow="KHÔNG GIAN AN TOÀN"
        title="Lân Cận & Chữa Lành"
        onOpenSearch={() => setIsSearchOpen(true)}
        onShowToast={showToast}
      />

      {/* Floating Micro-Toast */}
      {toastMessage && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <Text style={styles.toastEmoji}>✨</Text>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Radar Proximity Pill */}
        <View style={styles.radarBanner}>
          <View style={styles.radarIconWrap}>
            <View style={styles.radarPulseRing} />
            <Ionicons name="radio" size={16} color="#34D399" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.radarTitle}>Bán kính lân cận: ~2.0 km</Text>
            <Text style={styles.radarDesc}>
              Bảo vệ danh tính triệt để. Bài viết tự hủy sau 7 ngày.
            </Text>
          </View>
        </View>

        {/* Emotion Mood Pills Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodPillsRow}
        >
          <TouchableOpacity
            style={[styles.moodPill, activeMoodFilter === null && styles.moodPillActive]}
            onPress={() => setActiveMoodFilter(null)}
            activeOpacity={0.7}
          >
            <Text style={[styles.moodPillText, activeMoodFilter === null && styles.moodPillTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>

          {[
            { name: 'Yêu Đời', emoji: '😊', color: '#F59E0B' },
            { name: 'Nặng Lòng', emoji: '🌧️', color: '#60A5FA' },
            { name: 'Mệt Mỏi', emoji: '☕', color: '#A78BFA' },
            { name: 'Cô Đơn', emoji: '🌙', color: '#818CF8' },
          ].map((m) => {
            const isSelected = activeMoodFilter === m.name;
            return (
              <TouchableOpacity
                key={m.name}
                style={[
                  styles.moodPill,
                  isSelected && {
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    borderColor: '#C084FC',
                  },
                ]}
                onPress={() => setActiveMoodFilter(isSelected ? null : m.name)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 13 }}>{m.emoji}</Text>
                <Text style={[styles.moodPillText, isSelected && { color: '#C084FC', fontWeight: '700' }]}>
                  {m.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Nearby Feed Stack */}
        <View style={styles.feedStack}>
          {filteredPosts.map((post) => (
            <View key={post.id} style={styles.safePostCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.avatarRow}>
                  <View style={[styles.emojiBubble, { backgroundColor: `${post.moodColor}20` }]}>
                    <Text style={{ fontSize: 16 }}>{post.emoji}</Text>
                  </View>
                  <View>
                    <Text style={styles.authorTitle}>Ai đó gần đây</Text>
                    <Text style={styles.distanceMeta}>
                      📍 {post.distance} • {post.timeAgo}
                    </Text>
                  </View>
                </View>

                <View style={[styles.moodBadge, { borderColor: `${post.moodColor}40` }]}>
                  <Text style={[styles.moodBadgeText, { color: post.moodColor }]}>
                    {post.moodName}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardContentText}>{post.content}</Text>

              {/* Action Bar */}
              <View style={styles.cardActionRow}>
                <View style={styles.empathyBtnGroup}>
                  {/* Hug Button */}
                  <TouchableOpacity
                    style={[
                      styles.empathyBtn,
                      post.selectedReaction === 'hug' && styles.empathyBtnActiveHug,
                    ]}
                    onPress={() => handleReaction(post.id, 'hug')}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 14 }}>🤗</Text>
                    <Text
                      style={[
                        styles.empathyBtnText,
                        post.selectedReaction === 'hug' && styles.empathyBtnTextActive,
                      ]}
                    >
                      Ôm ({post.hugCount})
                    </Text>
                  </TouchableOpacity>

                  {/* Listen Button */}
                  <TouchableOpacity
                    style={[
                      styles.empathyBtn,
                      post.selectedReaction === 'listen' && styles.empathyBtnActiveListen,
                    ]}
                    onPress={() => handleReaction(post.id, 'listen')}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 14 }}>👂</Text>
                    <Text
                      style={[
                        styles.empathyBtnText,
                        post.selectedReaction === 'listen' && styles.empathyBtnTextActive,
                      ]}
                    >
                      Lắng nghe ({post.listenCount})
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Quick Copy */}
                <TouchableOpacity
                  style={styles.copyPillBtn}
                  onPress={() => handleCopy(post.content)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="copy-outline" size={13} color="#C084FC" />
                  <Text style={styles.copyPillText}>Chép</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Search Modal (k-NN Vector Search) - Tự đóng khi bấm ra ngoài */}
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
    paddingTop: 8,
    gap: 16,
  },
  radarBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0E1017',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  radarIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  radarPulseRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#34D399',
    opacity: 0.4,
  },
  radarTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34D399',
  },
  radarDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  moodPillsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0E1017',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  moodPillActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderColor: '#C084FC',
  },
  moodPillText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  moodPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  feedStack: {
    gap: 12,
  },
  safePostCard: {
    backgroundColor: '#0E1017',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    gap: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emojiBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  distanceMeta: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  moodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  moodBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardContentText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#F1F5F9',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  empathyBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  empathyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  empathyBtnActiveHug: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderColor: '#F472B6',
  },
  empathyBtnActiveListen: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderColor: '#60A5FA',
  },
  empathyBtnText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  empathyBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  copyPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.25)',
  },
  copyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C084FC',
  },
});
