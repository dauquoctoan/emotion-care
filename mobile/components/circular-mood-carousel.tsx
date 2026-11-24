import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export type AtmosphereType = 'obsidian' | 'sunset' | 'aurora' | 'paper';

export interface MoodOption {
  id: number;
  code: string;
  name: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  defaultAtmos: AtmosphereType;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 1,
    code: 'happy',
    name: 'An Yên & Vui Vẻ',
    desc: 'Bình yên, ấm áp và biết ơn',
    icon: 'sunny-outline',
    accentColor: '#F59E0B',
    defaultAtmos: 'sunset',
  },
  {
    id: 2,
    code: 'sad',
    name: 'Nặng Lòng',
    desc: 'Trút nhẹ nỗi buồn sâu kín',
    icon: 'rainy-outline',
    accentColor: '#60A5FA',
    defaultAtmos: 'obsidian',
  },
  {
    id: 3,
    code: 'tired',
    name: 'Mệt Mỏi',
    desc: 'Cần một khoảng lặng để thở',
    icon: 'cafe-outline',
    accentColor: '#A78BFA',
    defaultAtmos: 'paper',
  },
  {
    id: 4,
    code: 'stressed',
    name: 'Căng Thẳng',
    desc: 'Giải tỏa áp lực nặng trĩu',
    icon: 'flash-outline',
    accentColor: '#EF4444',
    defaultAtmos: 'obsidian',
  },
  {
    id: 5,
    code: 'lonely',
    name: 'Cô Đơn',
    desc: 'Tìm kiếm một sự thấu cảm',
    icon: 'moon-outline',
    accentColor: '#818CF8',
    defaultAtmos: 'aurora',
  },
  {
    id: 6,
    code: 'excited',
    name: 'Hy Vọng',
    desc: 'Rạng rỡ bừng nở tương lai',
    icon: 'sparkles-outline',
    accentColor: '#34D399',
    defaultAtmos: 'sunset',
  },
];

export const CODE_TO_MOOD_META: Record<
  string,
  {
    desc: string;
    icon: keyof typeof Ionicons.glyphMap;
    accentColor: string;
    defaultAtmos: AtmosphereType;
  }
> = {
  happy: { desc: 'Bình yên, ấm áp và biết ơn', icon: 'sunny-outline', accentColor: '#F59E0B', defaultAtmos: 'sunset' },
  sad: { desc: 'Trút nhẹ nỗi buồn sâu kín', icon: 'rainy-outline', accentColor: '#60A5FA', defaultAtmos: 'obsidian' },
  tired: { desc: 'Cần một khoảng lặng để thở', icon: 'cafe-outline', accentColor: '#A78BFA', defaultAtmos: 'paper' },
  stressed: { desc: 'Giải tỏa áp lực nặng trĩu', icon: 'flash-outline', accentColor: '#EF4444', defaultAtmos: 'obsidian' },
  lonely: { desc: 'Tìm kiếm một sự thấu cảm', icon: 'moon-outline', accentColor: '#818CF8', defaultAtmos: 'aurora' },
  excited: { desc: 'Rạng rỡ bừng nở tương lai', icon: 'sparkles-outline', accentColor: '#34D399', defaultAtmos: 'sunset' },
};

export function mapCategoryToMoodOption(cat: { id: number | string; code: string; name: string }): MoodOption {
  const meta = CODE_TO_MOOD_META[cat.code] || {
    desc: 'Chia sẻ cảm xúc chân thật',
    icon: 'sparkles-outline' as const,
    accentColor: '#C084FC',
    defaultAtmos: 'obsidian' as const,
  };
  return {
    id: Number(cat.id),
    code: cat.code,
    name: cat.name || 'Cảm xúc',
    desc: meta.desc,
    icon: meta.icon,
    accentColor: meta.accentColor,
    defaultAtmos: meta.defaultAtmos,
  };
}

const ITEM_WIDTH = 76;
const ORB_SIZE = 52;

interface MoodOrbItemProps {
  item: MoodOption;
  index: number;
  totalItems: number;
  itemWidth: number;
  centerX: number;
  translateX: SharedValue<number>;
  onPress: () => void;
}

function MoodOrbItem({
  item,
  index,
  totalItems,
  itemWidth,
  centerX,
  translateX,
  onPress,
}: MoodOrbItemProps) {
  const animatedSlotStyle = useAnimatedStyle(() => {
    const TOTAL_WIDTH = totalItems * itemWidth;
    const HALF_TOTAL = TOTAL_WIDTH / 2;

    const rawX = index * itemWidth + translateX.value;
    let diff = ((rawX % TOTAL_WIDTH) + TOTAL_WIDTH) % TOTAL_WIDTH;
    if (diff > HALF_TOTAL) {
      diff -= TOTAL_WIDTH;
    }

    const absDiff = Math.abs(diff);

    const scale = interpolate(
      absDiff,
      [0, itemWidth, itemWidth * 2],
      [1.24, 0.82, 0.70],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      absDiff,
      [0, itemWidth],
      [-6, 4],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      absDiff,
      [0, itemWidth, itemWidth * 1.8],
      [1, 0.55, 0.22],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: centerX - itemWidth / 2 + diff },
        { translateY },
        { scale },
      ],
      opacity,
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    const TOTAL_WIDTH = totalItems * itemWidth;
    const HALF_TOTAL = TOTAL_WIDTH / 2;

    const rawX = index * itemWidth + translateX.value;
    let diff = ((rawX % TOTAL_WIDTH) + TOTAL_WIDTH) % TOTAL_WIDTH;
    if (diff > HALF_TOTAL) {
      diff -= TOTAL_WIDTH;
    }

    const absDiff = Math.abs(diff);

    const glowOpacity = interpolate(
      absDiff,
      [0, itemWidth * 0.65],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity: glowOpacity,
    };
  });

  return (
    <Animated.View style={[styles.orbSlot, animatedSlotStyle]}>
      <Pressable onPress={onPress} style={styles.orbPressable}>
        {/* Concentric Glow Ring (smooth cross-fade on 120 FPS) */}
        <Animated.View
          style={[
            styles.activeConcentricGlow,
            {
              borderColor: `${item.accentColor}55`,
              backgroundColor: `${item.accentColor}15`,
            },
            glowAnimatedStyle,
          ]}
        />

        {/* Inactive Base Glass Orb */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)', '#090B10']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={[styles.orbCircle, { borderColor: 'rgba(255, 255, 255, 0.12)' }]}
        >
          <Ionicons name={item.icon} size={20} color="#94A3B8" />
        </LinearGradient>

        {/* Active Vibrant Orb (Cross-fades continuously on 120 FPS) */}
        <Animated.View style={[styles.activeOrbOverlay, glowAnimatedStyle]}>
          <LinearGradient
            colors={[`${item.accentColor}40`, `${item.accentColor}18`, '#0A0C14']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={[styles.orbCircle, { borderColor: item.accentColor }]}
          >
            <Ionicons name={item.icon} size={20} color={item.accentColor} />
          </LinearGradient>
        </Animated.View>

        {/* Micro active dot */}
        <Animated.View
          style={[
            styles.orbActiveDot,
            { backgroundColor: item.accentColor },
            glowAnimatedStyle,
          ]}
        />
      </Pressable>
    </Animated.View>
  );
}

interface CircularMoodCarouselProps {
  moods?: MoodOption[];
  selectedMood: MoodOption;
  onSelectMood: (mood: MoodOption) => void;
  containerStyle?: ViewStyle;
}

export default function CircularMoodCarousel({
  moods,
  selectedMood,
  onSelectMood,
  containerStyle,
}: CircularMoodCarouselProps) {
  const windowWidth = Dimensions.get('window').width;

  const dataList = useMemo(() => {
    return moods && moods.length > 0 ? moods : MOOD_OPTIONS;
  }, [moods]);

  const totalItems = dataList.length;

  // Tìm index ban đầu
  const initialIndex = useMemo(() => {
    const found = dataList.findIndex(
      (m) => m.code === selectedMood.code || m.id === selectedMood.id
    );
    return found >= 0 ? found : 0;
  }, [dataList, selectedMood.code, selectedMood.id]);

  const [activeIndexState, setActiveIndexState] = useState(initialIndex);

  const translateX = useSharedValue(-initialIndex * ITEM_WIDTH);
  const startX = useSharedValue(0);
  const lastHapticIndex = useSharedValue(initialIndex);

  // Active index derived value (100% UI Thread Worklet)
  const activeIndexDerived = useDerivedValue(() => {
    const TOTAL_WIDTH = totalItems * ITEM_WIDTH;
    const norm = ((-translateX.value % TOTAL_WIDTH) + TOTAL_WIDTH) % TOTAL_WIDTH;
    const idx = Math.round(norm / ITEM_WIDTH) % totalItems;
    return idx;
  });

  const triggerHaptics = useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  const handleMoodSelect = useCallback(
    (idx: number) => {
      setActiveIndexState(idx);
      const mood = dataList[idx];
      if (mood) {
        onSelectMood(mood);
      }
    },
    [dataList, onSelectMood]
  );

  // Lắng nghe sự thay đổi tâm trạng trên UI Thread
  useAnimatedReaction(
    () => activeIndexDerived.value,
    (current, previous) => {
      if (current !== previous && current !== lastHapticIndex.value) {
        lastHapticIndex.value = current;
        runOnJS(triggerHaptics)();
        runOnJS(handleMoodSelect)(current);
      }
    }
  );

  // Chạm trực tiếp vào một quả cầu để xoay mượt quả cầu đó vào giữa
  const handleItemPress = useCallback(
    (index: number) => {
      Haptics.selectionAsync();
      const TOTAL_WIDTH = totalItems * ITEM_WIDTH;
      const HALF_TOTAL = TOTAL_WIDTH / 2;

      const rawX = index * ITEM_WIDTH + translateX.value;
      let diff = ((rawX % TOTAL_WIDTH) + TOTAL_WIDTH) % TOTAL_WIDTH;
      if (diff > HALF_TOTAL) {
        diff -= TOTAL_WIDTH;
      }

      translateX.value = withSpring(translateX.value - diff, {
        damping: 24,
        stiffness: 240,
        mass: 0.6,
      });
    },
    [totalItems, translateX]
  );

  // Đồng bộ khi selectedMood thay đổi từ bên ngoài (hoặc tải từ API)
  useEffect(() => {
    const found = dataList.findIndex(
      (m) => m.code === selectedMood.code || m.id === selectedMood.id
    );
    if (found >= 0 && found !== activeIndexState) {
      handleItemPress(found);
    }
  }, [selectedMood.code, selectedMood.id, dataList, activeIndexState, handleItemPress]);

  // Gesture Pan 100% Native Physics
  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetX([-8, 8])
      .failOffsetY([-12, 12])
      .onStart(() => {
        startX.value = translateX.value;
      })
      .onUpdate((event) => {
        translateX.value = startX.value + event.translationX;
      })
      .onEnd((event) => {
        const velocity = event.velocityX;
        // Dự đoán điểm dừng mượt mà theo quán tính vận tốc
        const projected = translateX.value + velocity * 0.16;
        const snapped = Math.round(projected / ITEM_WIDTH) * ITEM_WIDTH;

        translateX.value = withSpring(snapped, {
          damping: 22,
          stiffness: 200,
          mass: 0.6,
          velocity: velocity,
        });
      });
  }, [startX, translateX]);

  const activeMoodData = dataList[activeIndexState] || selectedMood;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* 120 FPS Worklet Gesture Circular Dial */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.carouselContainer}>
          {dataList.map((item, idx) => (
            <MoodOrbItem
              key={item.code || `mood-${item.id}`}
              item={item}
              index={idx}
              totalItems={totalItems}
              itemWidth={ITEM_WIDTH}
              centerX={windowWidth / 2}
              translateX={translateX}
              onPress={() => handleItemPress(idx)}
            />
          ))}
        </View>
      </GestureDetector>

      {/* Dynamic Active Mood Description Card */}
      <View style={styles.activeMoodCard}>
        <View
          style={[
            styles.activeMoodPill,
            {
              borderColor: `${activeMoodData.accentColor}50`,
              backgroundColor: `${activeMoodData.accentColor}12`,
            },
          ]}
        >
          <Ionicons name={activeMoodData.icon} size={14} color={activeMoodData.accentColor} />
          <Text style={[styles.activeMoodName, { color: activeMoodData.accentColor }]}>
            {activeMoodData.name.toUpperCase()}
          </Text>
          <Text style={styles.activeMoodDescDivider}>•</Text>
          <Text style={styles.activeMoodDescText}>{activeMoodData.desc}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: -16,
    width: Dimensions.get('window').width,
    gap: 8,
    overflow: 'visible',
    paddingTop: 0,
    paddingBottom: 2,
  },
  carouselContainer: {
    position: 'relative',
    height: 88,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  orbSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: ITEM_WIDTH,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  orbPressable: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  activeConcentricGlow: {
    position: 'absolute',
    top: -7,
    left: -7,
    width: ORB_SIZE + 14,
    height: ORB_SIZE + 14,
    borderRadius: (ORB_SIZE + 14) / 2,
    borderWidth: 1,
    zIndex: -1,
  },
  orbCircle: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  activeOrbOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: ORB_SIZE,
    height: ORB_SIZE,
  },
  orbActiveDot: {
    position: 'absolute',
    bottom: -6,
    left: (ORB_SIZE - 5) / 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  activeMoodCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  activeMoodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  activeMoodName: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  activeMoodDescDivider: {
    fontSize: 10,
    color: '#64748B',
  },
  activeMoodDescText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '500',
  },
});
