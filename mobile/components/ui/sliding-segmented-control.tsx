import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: string | number;
}

export interface SlidingSegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  containerStyle?: ViewStyle;
  activeColor?: string; // Accent color for text/border/glow (default: '#C084FC')
  activeTextColor?: string; // Default: '#FFFFFF'
  inactiveTextColor?: string; // Default: '#64748B'
  activeIconColor?: string; // Default: '#C084FC'
  inactiveIconColor?: string; // Default: '#64748B'
  size?: 'sm' | 'md'; // 'sm' for compact inline controls, 'md' for standard screens
}

export default function SlidingSegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  containerStyle,
  activeColor = '#C084FC',
  activeTextColor = '#FFFFFF',
  inactiveTextColor = '#64748B',
  activeIconColor,
  inactiveIconColor = '#64748B',
  size = 'md',
}: SlidingSegmentedControlProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const resolvedActiveIconColor = activeIconColor || activeColor;

  const activeIndex = options.findIndex((opt) => opt.value === value);
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;
  const padding = 3;
  const totalTabs = options.length;
  const tabWidth = containerWidth > 0 ? (containerWidth - padding * 2) / totalTabs : 0;

  useEffect(() => {
    if (tabWidth > 0) {
      Animated.spring(slideAnim, {
        toValue: safeActiveIndex * tabWidth,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }).start();
    }
  }, [safeActiveIndex, tabWidth]);

  return (
    <View
      style={[
        styles.segmentWrapper,
        size === 'sm' && styles.segmentWrapperSm,
        containerStyle,
      ]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Animated Optical Glass Slider Pill */}
      {tabWidth > 0 && (
        <Animated.View
          style={[
            styles.activeSliderPill,
            size === 'sm' && styles.activeSliderPillSm,
            {
              width: tabWidth,
              borderColor: `${activeColor}55`,
              shadowColor: activeColor,
              transform: [{ translateX: slideAnim }],
            },
          ]}
          pointerEvents="none"
        >
          {/* Base Dark Glass */}
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.95)', 'rgba(15, 23, 42, 0.98)']}
            style={StyleSheet.absoluteFill}
          />
          {/* Glass Specular Top Highlight */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.16)', 'rgba(255, 255, 255, 0.02)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      {/* Segment Buttons */}
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.segmentBtn, size === 'sm' && styles.segmentBtnSm]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(option.value);
            }}
            activeOpacity={0.75}
          >
            <View style={styles.segmentContentRow}>
              {option.icon && (
                <Ionicons
                  name={option.icon}
                  size={size === 'sm' ? 12 : 13}
                  color={isActive ? resolvedActiveIconColor : inactiveIconColor}
                />
              )}
              <Text
                style={[
                  styles.segmentText,
                  size === 'sm' && styles.segmentTextSm,
                  { color: isActive ? activeTextColor : inactiveTextColor },
                  isActive && styles.segmentTextActive,
                ]}
              >
                {option.label}
                {option.badge !== undefined ? ` (${option.badge})` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmentWrapper: {
    flexDirection: 'row',
    backgroundColor: '#0E1017',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    position: 'relative',
    overflow: 'hidden',
  },
  segmentWrapperSm: {
    borderRadius: 14,
    padding: 2.5,
  },
  activeSliderPill: {
    position: 'absolute',
    top: 3,
    left: 3,
    bottom: 3,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  activeSliderPillSm: {
    top: 2.5,
    left: 2.5,
    bottom: 2.5,
    borderRadius: 11.5,
    shadowRadius: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    zIndex: 1,
  },
  segmentBtnSm: {
    paddingVertical: 5.5,
    paddingHorizontal: 6,
    borderRadius: 11.5,
  },
  segmentContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  segmentTextSm: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  segmentTextActive: {
    fontWeight: '800',
  },
});
