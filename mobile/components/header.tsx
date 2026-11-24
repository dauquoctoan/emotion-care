import NativeGlassButton from '@/components/ui/native-glass-button';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface HeaderProps {
  eyebrow?: string;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenSearch?: () => void;
  onShowToast?: (msg: string) => void;
  floating?: boolean;
  pillActionText?: string;
  onPillAction?: () => void;
  pillDisabled?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  rightAction?: React.ReactNode;
}

export default function Header({
  eyebrow,
  title = 'Words Matter',
  showBack = false,
  onBack,
  onOpenSearch,
  onShowToast,
  floating = true,
  pillActionText,
  onPillAction,
  pillDisabled = false,
  rightIcon,
  onRightIconPress,
  rightAction,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0 ? insets.top : (Platform.OS === 'ios' ? 47 : 24);

  const handleNotificationPress = () => {
    onShowToast?.('🔔 Bạn có 3 tương tác thấu cảm mới quanh khu vực');
  };

  const handleSearchPress = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      onShowToast?.('🔍 Mở thanh tìm kiếm thông minh k-NN...');
    }
  };

  const handleLeftPress = () => {
    if (onBack) {
      onBack();
    } else if (showBack) {
      router.back();
    } else {
      router.push('/settings');
    }
  };

  return (
    <View
      style={[
        styles.headerWrapper,
        floating ? styles.floatingHeader : null,
        { paddingTop: topInset },
      ]}
      pointerEvents="box-none"
    >
      {/* 
        Telegram Gradient: Đổ từ màu nền #08090C ở trên cùng (khu vực giờ/pin) 
        sang trong suốt ở khoảng nửa header đổ lên. 
        Từ giữa header trở xuống hoàn toàn trong suốt 100%.
      */}
      <LinearGradient
        colors={[
          '#08090C',
          'rgba(8, 9, 12, 0.85)',
          'rgba(8, 9, 12, 0.35)',
          'rgba(8, 9, 12, 0)',
        ]}
        locations={[0, 0.35, 0.65, 0.95]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Telegram-style Navigation Bar Row with Native Liquid Glass Buttons */}
      <View style={styles.appNavRow} pointerEvents="box-none">
        {/* Left Native Liquid Glass Button */}
        <NativeGlassButton
          onPress={handleLeftPress}
          icon={
            <Ionicons
              name={showBack ? 'chevron-back' : 'grid-outline'}
              size={showBack ? 20 : 17}
              color="#F8FAFC"
            />
          }
        />

        {/* Center Title: Crisp, bold, centered like Telegram */}
        <View style={styles.centerTitleColumn} pointerEvents="none">
          {eyebrow ? (
            <Text style={styles.eyebrowText} numberOfLines={1}>
              {eyebrow}
            </Text>
          ) : null}
          <View style={styles.titleRow}>
            <Text style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.sparkleStar}>✦</Text>
          </View>
        </View>

        {/* Right Actions: Native Liquid Glass Buttons (Action Icon / Search + Pill / Notification) */}
        <View style={styles.actionsRow}>
          {rightAction ? (
            rightAction
          ) : (
            <>
              {/* Custom Action Icon (e.g. AI Sparkles) OR Search Icon Circle Button */}
              {rightIcon ? (
                <NativeGlassButton
                  onPress={onRightIconPress || handleSearchPress}
                  icon={rightIcon}
                />
              ) : (
                <NativeGlassButton
                  onPress={handleSearchPress}
                  icon={<Ionicons name="search" size={16} color="#F8FAFC" />}
                />
              )}

              {/* Telegram Edit / Pill Button OR Notification Glass Circle Button */}
              {pillActionText ? (
                <NativeGlassButton
                  variant="pill"
                  label={pillActionText}
                  onPress={onPillAction || handleNotificationPress}
                  style={pillDisabled ? { opacity: 0.6 } : undefined}
                />
              ) : (
                <NativeGlassButton
                  onPress={handleNotificationPress}
                  badge={true}
                  icon={<Ionicons name="notifications-outline" size={17} color="#F8FAFC" />}
                />
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: 'transparent',
    paddingBottom: 8,
    paddingHorizontal: 16,
    zIndex: 50,
    overflow: 'visible',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  appNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: 3,
    overflow: 'visible',
  },
  centerTitleColumn: {
    position: 'absolute',
    left: 60,
    right: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrowText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C084FC',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  sparkleStar: {
    fontSize: 13,
    color: '#FBBF24',
    fontWeight: '900',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'visible',
  },
});
