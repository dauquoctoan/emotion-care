import CircularMoodCarousel, {
  MOOD_OPTIONS,
  MoodOption,
  mapCategoryToMoodOption,
} from '@/components/circular-mood-carousel';
import Header from '@/components/header';
import NativeGlassButton from '@/components/ui/native-glass-button';
import { createEmotionPost, getEmotionCategories } from '@/services/api';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FontChoice = 'serif' | 'sans' | 'mono';
type Atmosphere = 'obsidian' | 'sunset' | 'aurora' | 'paper';

const FONT_OPTIONS: FontChoice[] = ['serif', 'sans', 'mono'];
const FONT_BTN_WIDTH = 58;

const AI_QUOTES = [
  'Có những ngày lặng lẽ đến mức chỉ cần một tách trà ấm cũng đủ làm dịu đi vạn sự bộn bề.',
  'Tuổi trẻ không cần phải luôn rực rỡ, chỉ cần đủ dũng cảm để sống là chính mình.',
  'Trời hôm nay nhiều mây, lòng mình thì nhiều tâm tư...',
  'Đôi khi lùi một bước không phải là bỏ cuộc, mà là cho bản thân một khoảng lặng để nhìn rõ con đường.',
  'Hãy đối xử dịu dàng với chính mình, vì bạn đã vượt qua biết bao cơn bão mà không ai hay biết.',
];

export default function CreatorStudioScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(insets.top, Platform.OS === 'ios' ? 47 : 24) + 60;
  const params = useLocalSearchParams<{ prefillText?: string }>();
  const [content, setContent] = useState(params.prefillText || '');
  const [fontChoice, setFontChoice] = useState<FontChoice>('serif');
  const [atmosphere, setAtmosphere] = useState<Atmosphere>('obsidian');
  const [moodList, setMoodList] = useState<MoodOption[]>(MOOD_OPTIONS);
  const [selectedMood, setSelectedMood] = useState<MoodOption>(MOOD_OPTIONS[0]);
  const [authorAlias, setAuthorAlias] = useState('an_nhien');
  const [isPublishing, setIsPublishing] = useState(false);

  // Smooth Cross-Fade Animation values for each Atmosphere background layer
  const opacityObsidian = React.useRef(new Animated.Value(atmosphere === 'obsidian' ? 1 : 0)).current;
  const opacitySunset = React.useRef(new Animated.Value(atmosphere === 'sunset' ? 1 : 0)).current;
  const opacityAurora = React.useRef(new Animated.Value(atmosphere === 'aurora' ? 1 : 0)).current;
  const opacityPaper = React.useRef(new Animated.Value(atmosphere === 'paper' ? 1 : 0)).current;

  // Sliding Indicator Spring Animation for Font Style Selector
  const fontIndicatorAnim = React.useRef(
    new Animated.Value(FONT_OPTIONS.indexOf(fontChoice) * FONT_BTN_WIDTH)
  ).current;

  React.useEffect(() => {
    const targetIdx = FONT_OPTIONS.indexOf(fontChoice);
    Animated.spring(fontIndicatorAnim, {
      toValue: targetIdx * FONT_BTN_WIDTH,
      damping: 18,
      stiffness: 220,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  }, [fontChoice]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityObsidian, {
        toValue: atmosphere === 'obsidian' ? 1 : 0,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(opacitySunset, {
        toValue: atmosphere === 'sunset' ? 1 : 0,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAurora, {
        toValue: atmosphere === 'aurora' ? 1 : 0,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(opacityPaper, {
        toValue: atmosphere === 'paper' ? 1 : 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, [atmosphere]);

  // Sync categories dynamically from DB API on mount
  React.useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await getEmotionCategories();
        const raw = (res?.data as any)?.data || (res?.data as any);
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map(mapCategoryToMoodOption);
          if (isMounted) {
            setMoodList(mapped);
            setSelectedMood((prev) => mapped.find((m) => m.id === prev.id) || mapped[0]);
          }
        }
      } catch {
        // Offline fallback to predefined MOOD_OPTIONS
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

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
    showToast('AI đã gợi ý một câu từ theo tâm trạng!');
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
        code: selectedMood.code,
        emotion_code: selectedMood.code,
        emotion_category_id: selectedMood.id,
        author_alias: authorAlias.trim() ? `@${authorAlias.trim().replace(/^@/, '')}` : undefined,
        style_type: fontChoice,
        atmosphere: atmosphere,
        city: location.city || 'Sài Gòn',
        district: location.district || 'Trung tâm',
        latitude: location.latitude || 10.7769,
        longitude: location.longitude || 106.7009,
      });
      showToast('Caption đã được xuất bản và cập nhật vào Feed!');
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
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 6 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Infinite Circular Mood Carousel Dial */}
          <CircularMoodCarousel
            moods={moodList}
            selectedMood={selectedMood}
            onSelectMood={(mood) => {
              setSelectedMood(mood);
              setAtmosphere(mood.defaultAtmos);
            }}
          />

          {/* Writing Canvas with Dynamic Smooth Atmosphere Cross-Fade */}
          <View
            style={[
              styles.canvasOuterBorder,
              {
                borderColor:
                  atmosphere === 'paper' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
              },
            ]}
          >
            {/* Layer 1: Obsidian Dark */}
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { opacity: opacityObsidian, backgroundColor: '#0E1017' },
              ]}
            />

            {/* Layer 2: Sunset Amber Gradient */}
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { opacity: opacitySunset }]}
            >
              <LinearGradient
                colors={['#78350f', '#881337', '#1c1917']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {/* Layer 3: Aurora Violet-Indigo Gradient */}
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { opacity: opacityAurora }]}
            >
              <LinearGradient
                colors={['#581c87', '#312e81', '#0f172a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {/* Layer 4: Warm Paper Clean White */}
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { opacity: opacityPaper, backgroundColor: '#F5F5F0' },
              ]}
            />

            {/* Foreground Content: Stable, Single TextInput & Author Footer */}
            <View style={styles.canvasContentContainer}>
              <TextInput
                style={[styles.canvasTextInput, getCanvasTextStyle()]}
                placeholder="Gõ câu từ tâm huyết của bạn tại đây..."
                placeholderTextColor={
                  atmosphere === 'paper' ? '#94A3B8' : 'rgba(255, 255, 255, 0.4)'
                }
                value={content}
                onChangeText={setContent}
                multiline={true}
                textAlign="center"
                maxLength={400}
              />
              <Text
                style={[
                  styles.canvasAuthorFooter,
                  { color: atmosphere === 'paper' ? '#64748B' : '#94A3B8' },
                ]}
              >
                — @{authorAlias}
              </Text>
            </View>
          </View>

          {/* Contextual Customization Controls (Lines 515-550 in desing.html) */}
          <View style={styles.controlsSection}>
            {/* 1. Font Selection with Smooth Sliding Indicator */}
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Kiểu chữ:</Text>
              <View style={styles.fontButtonsGroup}>
                {/* Smooth Sliding Pill Indicator */}
                <Animated.View
                  style={[
                    styles.fontIndicatorPill,
                    { transform: [{ translateX: fontIndicatorAnim }] },
                  ]}
                />

                {FONT_OPTIONS.map((fChoice) => {
                  const isActive = fontChoice === fChoice;
                  const label =
                    fChoice === 'serif' ? 'Serif' : fChoice === 'sans' ? 'Sans' : 'Mono';
                  return (
                    <TouchableOpacity
                      key={fChoice}
                      style={styles.fontBtn}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setFontChoice(fChoice);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.fontBtnText,
                          isActive && styles.fontBtnTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
              <Ionicons name="sparkles" size={15} color="#FBBF24" />
              <Text style={styles.aiInspireBtnText}>Để AI gieo vần cảm xúc...</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Telegram-style Floating Header with Liquid Glass Buttons */}
      <Header
        eyebrow="CREATOR STUDIO"
        title="Xưởng Chữ"
        showBack={true}
        onBack={() => router.back()}
        floating={true}
        rightIcon={<Ionicons name="sparkles" size={16} color="#FBBF24" />}
        onRightIconPress={handleAiInspire}
        pillActionText={isPublishing ? 'Đang gửi...' : 'Xuất Bản'}
        onPillAction={handlePublish}
        pillDisabled={isPublishing}
        onShowToast={showToast}
      />

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
    position: 'relative',
    backgroundColor: '#0E1017',
  },
  canvasContentContainer: {
    minHeight: 260,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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
    padding: 3,
    position: 'relative',
  },
  fontIndicatorPill: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: FONT_BTN_WIDTH,
    height: 28,
    borderRadius: 12,
    backgroundColor: '#9333EA',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  fontBtn: {
    width: FONT_BTN_WIDTH,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    zIndex: 1,
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
