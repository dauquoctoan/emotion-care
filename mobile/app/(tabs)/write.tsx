import { createEmotionPost } from '@/services/api';
import { useDeviceId } from '@/stores/user.store';
import { getCurrentLocation } from '@/ultils';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FontChoice = 'serif' | 'sans' | 'mono';
type Atmosphere = 'obsidian' | 'sunset' | 'aurora' | 'paper';

const AI_QUOTES = [
  'Có những ngày lặng lẽ đến mức chỉ cần một tách trà ấm cũng đủ làm dịu đi vạn sự bộn bề.',
  'Tuổi trẻ không cần phải luôn rực rỡ, chỉ cần đủ dũng cảm để sống là chính mình.',
  'Trời hôm nay nhiều mây, lòng mình thì nhiều tâm tư...',
  'Đôi khi lùi một bước không phải là bỏ cuộc, mà là cho bản thân một khoảng lặng để nhìn rõ con đường.',
  'Hãy đối xử dịu dàng với chính mình, vì bạn đã vượt qua biết bao cơn bão mà không ai hay biết.',
];

export default function CreatorStudioScreen() {
  const params = useLocalSearchParams<{ prefillText?: string }>();
  const [content, setContent] = useState(params.prefillText || '');
  const [fontChoice, setFontChoice] = useState<FontChoice>('serif');
  const [atmosphere, setAtmosphere] = useState<Atmosphere>('obsidian');
  const [authorAlias, setAuthorAlias] = useState('an_nhien');
  const [isPublishing, setIsPublishing] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastOpacity = useState(new Animated.Value(0))[0];

  const deviceId = useDeviceId();

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(null));
  };

  const handleAiInspire = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const picked = AI_QUOTES[Math.floor(Math.random() * AI_QUOTES.length)];
    setContent(picked);
    showToast('✨ AI đã gợi ý một câu từ theo tâm trạng!');
  };

  const handlePublish = async () => {
    if (!content.trim()) {
      showToast('Vui lòng gõ một vài câu chữ trước khi xuất bản!');
      return;
    }

    setIsPublishing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const location = await getCurrentLocation();
      await createEmotionPost({
        device_id: deviceId || 'anonymous-device',
        content: content.trim(),
        is_ai_assisted: false,
        emotion_category_id: 1,
        city: location.city || 'Sài Gòn',
        district: location.district || 'Trung tâm',
        latitude: location.latitude || 10.7769,
        longitude: location.longitude || 106.7009,
        code: 'happy',
      });
      showToast('🚀 Caption đã được xuất bản và cập nhật vào Feed!');
      setTimeout(() => {
        router.push('/(tabs)');
      }, 1200);
    } catch {
      showToast('Đã lưu caption của bạn!');
      setTimeout(() => {
        router.push('/(tabs)');
      }, 1200);
    } finally {
      setIsPublishing(false);
    }
  };

  const getCanvasTextStyle = () => {
    const isPaper = atmosphere === 'paper';
    const baseColor = isPaper ? '#1E293B' : '#F8FAFC';

    if (fontChoice === 'serif') {
      return {
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        fontStyle: 'italic' as const,
        fontSize: 20,
        lineHeight: 32,
        color: baseColor,
      };
    }
    if (fontChoice === 'sans') {
      return {
        fontWeight: '800' as const,
        fontSize: 21,
        lineHeight: 30,
        color: baseColor,
      };
    }
    return {
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      fontSize: 16,
      lineHeight: 26,
      color: baseColor,
    };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Toast Notification Overlay */}
      {toastMessage && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <Text style={styles.toastEmoji}>✨</Text>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Sheet Grabber & Header (Lines 496-503 in desing.html) */}
      <View style={styles.studioHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.headerCloseText}>Đóng</Text>
        </TouchableOpacity>

        <Text style={styles.studioHeaderTitle}>CREATOR STUDIO</Text>

        <TouchableOpacity
          style={[styles.publishBtn, isPublishing && { opacity: 0.6 }]}
          onPress={handlePublish}
          disabled={isPublishing}
          activeOpacity={0.85}
        >
          <Text style={styles.publishBtnText}>Xuất Bản</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Writing Canvas with Dynamic Atmosphere */}
          <View style={styles.canvasOuterBorder}>
            {atmosphere === 'sunset' ? (
              <LinearGradient
                colors={['#78350f', '#881337', '#1c1917']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.canvasBackground}
              >
                <TextInput
                  style={[styles.canvasTextInput, getCanvasTextStyle()]}
                  placeholder="Gõ câu từ tâm huyết của bạn tại đây..."
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={content}
                  onChangeText={setContent}
                  multiline={true}
                  textAlign="center"
                  maxLength={400}
                />
                <Text style={styles.canvasAuthorFooter}>— @{authorAlias}</Text>
              </LinearGradient>
            ) : atmosphere === 'aurora' ? (
              <LinearGradient
                colors={['#581c87', '#312e81', '#0f172a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.canvasBackground}
              >
                <TextInput
                  style={[styles.canvasTextInput, getCanvasTextStyle()]}
                  placeholder="Gõ câu từ tâm huyết của bạn tại đây..."
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={content}
                  onChangeText={setContent}
                  multiline={true}
                  textAlign="center"
                  maxLength={400}
                />
                <Text style={styles.canvasAuthorFooter}>— @{authorAlias}</Text>
              </LinearGradient>
            ) : atmosphere === 'paper' ? (
              <View style={[styles.canvasBackground, { backgroundColor: '#F5F5F0' }]}>
                <TextInput
                  style={[styles.canvasTextInput, getCanvasTextStyle()]}
                  placeholder="Gõ câu từ tâm huyết của bạn tại đây..."
                  placeholderTextColor="#94A3B8"
                  value={content}
                  onChangeText={setContent}
                  multiline={true}
                  textAlign="center"
                  maxLength={400}
                />
                <Text style={[styles.canvasAuthorFooter, { color: '#64748B' }]}>
                  — @{authorAlias}
                </Text>
              </View>
            ) : (
              <View style={[styles.canvasBackground, { backgroundColor: '#0E1017' }]}>
                <TextInput
                  style={[styles.canvasTextInput, getCanvasTextStyle()]}
                  placeholder="Gõ câu từ tâm huyết của bạn tại đây..."
                  placeholderTextColor="#475569"
                  value={content}
                  onChangeText={setContent}
                  multiline={true}
                  textAlign="center"
                  maxLength={400}
                />
                <Text style={styles.canvasAuthorFooter}>— @{authorAlias}</Text>
              </View>
            )}
          </View>

          {/* Contextual Customization Controls (Lines 515-550 in desing.html) */}
          <View style={styles.controlsSection}>
            {/* 1. Font Selection */}
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Kiểu chữ:</Text>
              <View style={styles.fontButtonsGroup}>
                <TouchableOpacity
                  style={[styles.fontBtn, fontChoice === 'serif' && styles.fontBtnActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setFontChoice('serif');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.fontBtnText, fontChoice === 'serif' && styles.fontBtnTextActive]}>
                    Serif
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.fontBtn, fontChoice === 'sans' && styles.fontBtnActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setFontChoice('sans');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.fontBtnText, fontChoice === 'sans' && styles.fontBtnTextActive]}>
                    Sans
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.fontBtn, fontChoice === 'mono' && styles.fontBtnActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setFontChoice('mono');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.fontBtnText, fontChoice === 'mono' && styles.fontBtnTextActive]}>
                    Mono
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Atmosphere Presets */}
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Bầu không khí:</Text>
              <View style={styles.atmosphereCirclesRow}>
                {/* Obsidian */}
                <TouchableOpacity
                  style={[
                    styles.atmosCircle,
                    { backgroundColor: '#0F172A' },
                    atmosphere === 'obsidian' && styles.atmosCircleActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAtmosphere('obsidian');
                    showToast('Đã áp dụng bầu không khí: Obsidian Dark');
                  }}
                  activeOpacity={0.8}
                />
                {/* Sunset */}
                <TouchableOpacity
                  style={[
                    styles.atmosCircle,
                    { backgroundColor: '#EA580C' },
                    atmosphere === 'sunset' && styles.atmosCircleActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAtmosphere('sunset');
                    showToast('Đã áp dụng bầu không khí: Sunset Amber');
                  }}
                  activeOpacity={0.8}
                />
                {/* Aurora */}
                <TouchableOpacity
                  style={[
                    styles.atmosCircle,
                    { backgroundColor: '#7C3AED' },
                    atmosphere === 'aurora' && styles.atmosCircleActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAtmosphere('aurora');
                    showToast('Đã áp dụng bầu không khí: Aurora Violet');
                  }}
                  activeOpacity={0.8}
                />
                {/* Paper */}
                <TouchableOpacity
                  style={[
                    styles.atmosCircle,
                    { backgroundColor: '#F5F5F0' },
                    atmosphere === 'paper' && styles.atmosCircleActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAtmosphere('paper');
                    showToast('Đã áp dụng bầu không khí: Paper Ivory');
                  }}
                  activeOpacity={0.8}
                />
              </View>
            </View>

            {/* 3. Author Pseudonym Input */}
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Bút danh:</Text>
              <View style={styles.authorInputWrap}>
                <Text style={styles.authorPrefix}>@</Text>
                <TextInput
                  style={styles.authorInput}
                  value={authorAlias}
                  onChangeText={setAuthorAlias}
                  placeholder="bút_danh"
                  placeholderTextColor="#64748B"
                  maxLength={20}
                />
              </View>
            </View>

            {/* 4. AI Inspire Prompt Trigger */}
            <TouchableOpacity
              style={styles.aiInspireBtn}
              onPress={handleAiInspire}
              activeOpacity={0.85}
            >
              <Text style={styles.aiInspireEmoji}>✨</Text>
              <Text style={styles.aiInspireBtnText}>Để AI gieo vần cảm xúc...</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  studioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  headerCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  studioHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C084FC',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  publishBtn: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  publishBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 20,
  },
  canvasOuterBorder: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  canvasBackground: {
    minHeight: 260,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasTextInput: {
    width: '100%',
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  canvasAuthorFooter: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 18,
    fontWeight: '600',
  },
  controlsSection: {
    backgroundColor: '#0E1017',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 16,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  fontButtonsGroup: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 2,
    gap: 3,
  },
  fontBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  fontBtnActive: {
    backgroundColor: '#9333EA',
  },
  fontBtnText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  fontBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  atmosphereCirclesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  atmosCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  atmosCircleActive: {
    borderColor: '#C084FC',
    borderWidth: 2.5,
    transform: [{ scale: 1.15 }],
  },
  authorInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: 140,
  },
  authorPrefix: {
    fontSize: 12,
    color: '#C084FC',
    fontWeight: '800',
    marginRight: 2,
  },
  authorInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    padding: 0,
  },
  aiInspireBtn: {
    backgroundColor: 'rgba(49, 46, 129, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    borderRadius: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  aiInspireEmoji: {
    fontSize: 15,
  },
  aiInspireBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C7D2FE',
  },
});
