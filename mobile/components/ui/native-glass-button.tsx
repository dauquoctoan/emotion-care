import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import {
  Animated,
  Insets,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

export interface NativeGlassButtonProps {
  onPress: () => void;
  variant?: 'circle' | 'pill';
  size?: number; // Diameter for circle (default: 38)
  icon?: React.ReactNode;
  label?: string;
  badge?: boolean;
  style?: StyleProp<ViewStyle>;
  hitSlop?: Insets | number;
  testID?: string;
  children?: React.ReactNode;
}

/**
 * Native Liquid Glass Button:
 * Mimics Apple iOS 18 & Telegram native liquid glass navigation buttons:
 * - Anti-clipping Architecture: Separates the border layer from the clipped blur/sheen background,
 *   preventing React Native / iOS CoreAnimation from shaving/flattening borders at top, bottom, left, and right extremes.
 * - Real UIVisualEffectView BlurView (`systemUltraThinMaterialDark` on iOS, CSS backdrop blur on web)
 * - Specular reflection highlight gradient
 * - Dual-layer depth shadow with full overflow clearance
 * - Native Spring physics (scales down smoothly to 0.92 on press, springs back on release)
 * - Instant Light Haptic feedback on touch down
 * - Supports both circular action buttons (38x38) and Telegram-style capsule pills ("Sửa", "+ Viết")
 */
export default function NativeGlassButton({
  onPress,
  variant = 'circle',
  size = 38,
  icon,
  label,
  badge = false,
  style,
  hitSlop,
  testID,
  children,
}: NativeGlassButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    // 1. Instant native iOS haptic feedback on touch down
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.selectionAsync();
    }

    // 2. Physical spring compression
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 28,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    // 3. Elastic spring rebound
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      useNativeDriver: true,
      speed: 22,
      bounciness: 6,
    }).start();
  };

  const isCircle = variant === 'circle';
  const borderRadius = isCircle ? size / 2 : 17;

  return (
    <Animated.View
      style={[
        styles.shadowWrapper,
        isCircle
          ? { width: size, height: size, borderRadius }
          : styles.pillWrapper,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        hitSlop={hitSlop}
        testID={testID}
        style={[
          styles.pressableContainer,
          isCircle
            ? { width: size, height: size, borderRadius }
            : [styles.pillInner, { borderRadius }],
        ]}
      >
        {/* Layer 1: Clipped Liquid Glass Blur & Background (Isolated from border to avoid clipping) */}
        <View style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}>
          {Platform.OS === 'ios' || Platform.OS === 'web' ? (
            <BlurView
              tint="systemUltraThinMaterialDark"
              intensity={85}
              style={[StyleSheet.absoluteFill, { borderRadius }]}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidGlassFallback, { borderRadius }]} />
          )}

          {/* Ambient Dark Tint Under Glass */}
          <View style={[StyleSheet.absoluteFill, styles.ambientGlassTint]} />

          {/* Liquid Glass Specular Reflection Highlight (Ánh sáng phản chiếu mặt kính) */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0.03)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </View>

        {/* Layer 2: 100% Unclipped Specular Border Rim (Prevents top/bottom/left/right border clipping) */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.18)',
            },
          ]}
          pointerEvents="none"
        />

        {/* Layer 3: Button Content */}
        <View style={styles.contentContainer} pointerEvents="none">
          {children ? (
            children
          ) : (
            <View style={styles.rowContent}>
              {icon}
              {label ? (
                <Text style={[styles.pillLabel, icon ? { marginLeft: 5 } : null]}>
                  {label}
                </Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Layer 4: Notification Pulse Dot (Outside clipped layer so it stays complete) */}
        {badge ? <View style={styles.badgePulseDot} /> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    // Outer floating depth shadow with overflow visible
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 4,
    overflow: 'visible',
  },
  pillWrapper: {
    height: 34,
    minWidth: 54,
  },
  pressableContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  pillInner: {
    height: 34,
    paddingHorizontal: 13,
  },
  ambientGlassTint: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  androidGlassFallback: {
    backgroundColor: 'rgba(24, 28, 38, 0.82)',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  badgePulseDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#C084FC',
    borderWidth: 1.5,
    borderColor: '#0E1017',
    zIndex: 3,
  },
});
