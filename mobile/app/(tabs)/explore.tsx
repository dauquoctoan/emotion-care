import Header from '@/components/header';
import SearchModal from '@/components/search-modal';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TopicCollection {
  id: string;
  emoji: string;
  tag: string;
  title: string;
  desc: string;
  count: string;
  gradient: [string, string];
  quotes: { id: string; author: string; text: string; copies: number }[];
}

const TOPIC_COLLECTIONS: TopicCollection[] = [
  {
    id: 't-1',
    emoji: '🌧️',
    tag: 'Cho ngày mưa',
    title: 'Những câu chữ dành cho ngày mưa',
    desc: 'Lắng đọng cùng tiếng mưa rơi ngoài hiên, gom góp lại những vụn vỡ dịu dàng.',
    count: '128 câu',
    gradient: ['#0f172a', '#1e1b4b'],
    quotes: [
      {
        id: 'q-101',
        author: '@mưa_đêm',
        text: 'Có những ngày lặng lẽ đến mức tiếng mưa rơi ngoài hiên cũng hóa thành lời an ủi dịu dàng nhất.',
        copies: 1420,
      },
      {
        id: 'q-102',
        author: '@an_nhien',
        text: 'Mưa rửa trôi bụi bặm của phố xá, cũng cuốn trôi bớt những muộn phiền ta mang trong lòng.',
        copies: 890,
      },
      {
        id: 'q-103',
        author: '@saigon_rain',
        text: 'Ngồi trong quán quen, ngắm mưa rơi qua ô kính, nhận ra mình đã đi qua bao giông bão một cách kiên cường.',
        copies: 640,
      },
    ],
  },
  {
    id: 't-2',
    emoji: '☕',
    tag: 'Trạm dừng chân',
    title: 'Bình yên thôi cũng đã đủ',
    desc: 'Không cần quá rực rỡ, chỉ cần một góc nhỏ ấm áp và bình yên trong tâm trí.',
    count: '94 câu',
    gradient: ['#1c1917', '#451a03'],
    quotes: [
      {
        id: 'q-201',
        author: '@tiem_ca_phe',
        text: 'Hạnh phúc đôi khi chỉ là một sớm mai thức dậy, pha ly cà phê ấm và thấy lòng nhẹ tênh.',
        copies: 1250,
      },
      {
        id: 'q-202',
        author: '@mộc_miên',
        text: 'Đừng vội chạy theo kỳ vọng của người khác, nhịp điệu của bạn đã là một giai điệu hoàn hảo rồi.',
        copies: 910,
      },
    ],
  },
  {
    id: 't-3',
    emoji: '🚀',
    tag: 'Khát vọng',
    title: 'Tuổi trẻ và những ngã rẽ',
    desc: 'Những câu từ tiếp thêm lửa cho hoài bão, vượt qua nỗi sợ thất bại.',
    count: '210 câu',
    gradient: ['#1c1917', '#4c0519'],
    quotes: [
      {
        id: 'q-301',
        author: '@genz_dreamer',
        text: 'Tuổi trẻ không cần phải luôn rực rỡ, chỉ cần đủ can đảm để sống theo cách mình muốn và không hối tiếc.',
        copies: 2310,
      },
      {
        id: 'q-302',
        author: '@người_dẫn_đường',
        text: 'Con đường phía trước có thể mù sương, nhưng mỗi bước chân bạn bước đều đang xua tan bóng tối.',
        copies: 1540,
      },
    ],
  },
  {
    id: 't-4',
    emoji: '🌙',
    tag: 'Về đêm',
    title: 'Nỗi nhớ không tên giữa bốn bức tường',
    desc: 'Không gian cho những suy tư sâu lắng khi thành phố đã chìm vào giấc ngủ.',
    count: '165 câu',
    gradient: ['#1e1b4b', '#2e1065'],
    quotes: [
      {
        id: 'q-401',
        author: '@người_lạ_đêm',
        text: 'Đêm nay trăng rất sáng, nếu bạn cũng đang cô đơn, hãy nhớ rằng vũ trụ vẫn đang ôm lấy bạn.',
        copies: 880,
      },
      {
        id: 'q-402',
        author: '@phố_khuya',
        text: 'Những điều khó nói nhất vào ban ngày, thường tìm về thăm bạn lúc hai giờ sáng.',
        copies: 730,
      },
    ],
  },
];

export default function TopicsScreen() {
  const params = useLocalSearchParams<{ collectionTitle?: string }>();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    params.collectionTitle ? TOPIC_COLLECTIONS.find((t) => t.title === params.collectionTitle)?.id || null : null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const handleCopy = async (id: string, text: string) => {
    await Clipboard.setStringAsync(`${text} #EmotionCare`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedId(id);
    showToast('✨ Đã lưu caption vào bộ nhớ tạm kèm #EmotionCare!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditInStudio = (text: string) => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/(tabs)/write',
      params: { prefillText: text },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        eyebrow="GIÁM TUYỂN THỦ CÔNG"
        title="Chủ Đề & Tuyển Tập"
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
      >
        {/* Intro Banner */}
        <View style={styles.introBanner}>
          <Text style={styles.introTitle}>Khám phá theo dòng cảm xúc</Text>
          <Text style={styles.introSubtitle}>
            Các tuyển tập được biên tập viên tuyển chọn tỉ mỉ theo từng nhịp điệu tâm trạng và thời khắc trong ngày.
          </Text>
        </View>

        {/* Collections Stack */}
        <View style={styles.collectionsStack}>
          {TOPIC_COLLECTIONS.map((topic) => {
            const isExpanded = selectedTopicId === topic.id;
            return (
              <View key={topic.id} style={styles.topicCardWrap}>
                <TouchableOpacity
                  style={styles.topicCardTouchable}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedTopicId(isExpanded ? null : topic.id);
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={topic.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.topicCardGradient}
                  >
                    <View style={styles.topicHeaderRow}>
                      <View style={styles.topicTitleLeft}>
                        <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                        <View>
                          <Text style={styles.topicTagText}>{topic.tag}</Text>
                          <Text style={styles.topicMainTitle}>{topic.title}</Text>
                        </View>
                      </View>
                      <View style={styles.topicCountBadge}>
                        <Text style={styles.topicCountText}>{topic.count}</Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={14}
                          color="#CBD5E1"
                        />
                      </View>
                    </View>
                    <Text style={styles.topicDescText}>{topic.desc}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Expanded Captions List */}
                {isExpanded && (
                  <View style={styles.expandedCaptionsWrap}>
                    {topic.quotes.map((q) => {
                      const isCopied = copiedId === q.id;
                      return (
                        <View key={q.id} style={styles.quoteItemCard}>
                          <View style={styles.quoteItemHeader}>
                            <Text style={styles.quoteAuthorText}>{q.author}</Text>
                            <TouchableOpacity
                              onPress={() => handleEditInStudio(q.text)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.quoteEditLink}>Edit trong Studio ✎</Text>
                            </TouchableOpacity>
                          </View>

                          <Text style={styles.quoteBodyText}>"{q.text}"</Text>

                          <View style={styles.quoteItemFooter}>
                            <Text style={styles.quoteCopiesText}>{q.copies} lượt copy</Text>
                            <TouchableOpacity
                              style={[styles.itemCopyBtn, isCopied && styles.itemCopyBtnSuccess]}
                              onPress={() => handleCopy(q.id, q.text)}
                              activeOpacity={0.8}
                            >
                              <Ionicons
                                name={isCopied ? 'checkmark' : 'copy'}
                                size={12}
                                color="#FFFFFF"
                              />
                              <Text style={styles.itemCopyBtnText}>
                                {isCopied ? '✓ Đã chép' : '1-Tap Copy'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
  introBanner: {
    backgroundColor: '#0E1017',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  introTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#C084FC',
  },
  introSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  collectionsStack: {
    gap: 14,
  },
  topicCardWrap: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0E1017',
  },
  topicCardTouchable: {
    borderRadius: 24,
  },
  topicCardGradient: {
    padding: 18,
    gap: 10,
  },
  topicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  topicTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  topicEmoji: {
    fontSize: 32,
  },
  topicTagText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#93C5FD',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  topicMainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  topicCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicCountText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#E2E8F0',
    fontWeight: '600',
  },
  topicDescText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  expandedCaptionsWrap: {
    padding: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#090B10',
  },
  quoteItemCard: {
    backgroundColor: '#12141F',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  quoteItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quoteAuthorText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C084FC',
  },
  quoteEditLink: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  quoteBodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#F8FAFC',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  quoteItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  quoteCopiesText: {
    fontSize: 10,
    color: '#64748B',
  },
  itemCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#9333EA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  itemCopyBtnSuccess: {
    backgroundColor: '#059669',
  },
  itemCopyBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
