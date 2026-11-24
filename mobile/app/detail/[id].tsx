import Header from '@/components/header';
import { copyPostCaption, reactToEmotionPost } from '@/services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Reaction = 'hug' | 'listen' | 'withYou' | null;

const REACTIONS: { key: Reaction; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { key: 'hug', icon: 'heart', label: 'Gửi cái ôm' },
  { key: 'listen', icon: 'chatbubble-ellipses-outline', label: 'Lắng nghe' },
  { key: 'withYou', icon: 'sparkles', label: 'Ở đây cùng bạn' },
];

export default function ExploreDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(insets.top, Platform.OS === 'ios' ? 47 : 24) + 60;
  const { emoji, content, location, time, id } = useLocalSearchParams<{
    emoji: string;
    content: string;
    location: string;
    time: string;
    id: string;
  }>();

  const [selectedReaction, setSelectedReaction] = useState<Reaction>(null);
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

  const handleCopy = async () => {
    if (content) {
      await Clipboard.setStringAsync(content);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Đã sao chép caption vào bộ nhớ tạm!');
      if (id) {
        copyPostCaption(id);
      }
    }
  };

  const handleReaction = async (reaction: Reaction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const nextReaction = selectedReaction === reaction ? null : reaction;
    setSelectedReaction(nextReaction);

    if (id) {
      const typeIdMap: Record<string, number> = {
        hug: 1,
        listen: 2,
        withYou: 3,
      };
      const reactionTypeId = (reaction && typeIdMap[reaction]) || 1;
      try {
        await reactToEmotionPost(id, reactionTypeId);
      } catch (err) {
        console.log('Failed to react:', err);
      }
    }
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Location & Time Indicator */}
        <View style={styles.locationPillWrap}>
          <View style={styles.locationPill}>
            <Ionicons name="location-sharp" size={12} color="#C084FC" />
            <Text style={styles.locationText}>{location ?? 'Khu vực gần đây'}</Text>
          </View>
          <Text style={styles.timeText}>• {time ?? 'Vừa xong'}</Text>
        </View>

        {/* Emotion Emoji Avatar */}
        <View style={styles.emojiContainer}>
          <View style={styles.emojiCircle}>
            {emoji && emoji.length > 2 ? (
              <Ionicons name={(emoji as any) || 'leaf-outline'} size={24} color="#C084FC" />
            ) : emoji ? (
              <Text style={styles.emoji}>{emoji}</Text>
            ) : (
              <Ionicons name="leaf-outline" size={24} color="#34D399" />
            )}
          </View>
        </View>

        {/* Big Editorial Quote Card */}
        <View style={styles.card}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.contentText}>{content ?? ''}</Text>

          {/* Quick Copy Button */}
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.7}>
            <Ionicons name="copy-outline" size={14} color="#C084FC" />
            <Text style={styles.copyBtnText}>Sao Chép Caption</Text>
          </TouchableOpacity>
        </View>

        {/* Empathy Prompt & Reactions */}
        <Text style={styles.reactionPrompt}>
          Gửi gắm một chút ấm áp đến người bạn ẩn danh này:
        </Text>

        <View style={styles.reactionsRow}>
          {REACTIONS.map((r) => {
            const isActive = selectedReaction === r.key;
            return (
              <View key={r.key} style={styles.reactionItem}>
                <TouchableOpacity
                  style={[styles.reactionCircle, isActive && styles.reactionCircleActive]}
                  onPress={() => handleReaction(r.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={r.icon} size={20} color={isActive ? '#FFFFFF' : '#C084FC'} />
                </TouchableOpacity>
                <Text style={[styles.reactionLabel, isActive && styles.reactionLabelActive]}>
                  {r.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Safe Space Privacy Guarantee */}
        <View style={styles.privacyGuaranteeCard}>
          <Ionicons name="shield-checkmark" size={16} color="#34D399" />
          <Text style={styles.privacyGuaranteeText}>
            Tâm sự này hoàn toàn ẩn danh và sẽ tự động biến mất theo chu kỳ riêng tư.
          </Text>
        </View>
      </ScrollView>

      {/* Native Liquid Glass Header with Top Gradient Fade */}
      <Header title="CHI TIẾT CẢM XÚC" showBack={true} floating={true} />

      {/* Floating Micro-Toast */}
      {toastMessage && (
        <Animated.View style={[styles.toastContainer, { top: headerHeight + 12, opacity: toastOpacity }]}>
          <Ionicons name="sparkles" size={14} color="#C084FC" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.4)',
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
    alignItems: 'center',
  },
  locationPillWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0E1017',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.25)',
  },
  locationText: {
    fontSize: 12,
    color: '#C084FC',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
  },
  emojiContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emojiCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#0E1017',
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  emoji: {
    fontSize: 38,
  },
  card: {
    backgroundColor: '#0E1017',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    marginBottom: 28,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  quoteMark: {
    position: 'absolute',
    top: -8,
    left: 18,
    fontSize: 52,
    color: 'rgba(192, 132, 252, 0.18)',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  contentText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 18,
    lineHeight: 28,
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 22,
    fontStyle: 'italic',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C084FC',
  },
  reactionPrompt: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
  },
  reactionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    marginBottom: 32,
  },
  reactionItem: {
    alignItems: 'center',
    gap: 8,
  },
  reactionCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0E1017',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionCircleActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: '#C084FC',
    borderWidth: 1.5,
  },
  reactionEmoji: {
    fontSize: 26,
  },
  reactionLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  reactionLabelActive: {
    color: '#C084FC',
    fontWeight: '700',
  },
  privacyGuaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  privacyGuaranteeText: {
    flex: 1,
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
});
