import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  eyebrow?: string;
  title?: string;
  showBack?: boolean;
  onOpenSearch?: () => void;
  onShowToast?: (msg: string) => void;
}

export default function Header({
  eyebrow = 'KHÁM PHÁ HÔM NAY',
  title = 'Words Matter',
  showBack = false,
  onOpenSearch,
  onShowToast,
}: HeaderProps) {
  const handleNotificationPress = () => {
    Haptics.selectionAsync();
    onShowToast?.('🔔 Bạn có 3 tương tác thấu cảm mới quanh khu vực');
  };

  const handleSearchPress = () => {
    Haptics.selectionAsync();
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      onShowToast?.('🔍 Mở thanh tìm kiếm thông minh k-NN...');
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.appNavRow}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.circleBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color="#E2E8F0" />
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleColumn}>
          <View style={styles.eyebrowRow}>
            <Text style={styles.eyebrowText}>{eyebrow}</Text>
            <View style={styles.anonBadge}>
              <View style={styles.anonDot} />
              <Text style={styles.anonText}>Ẩn danh</Text>
            </View>
          </View>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.sparkleStar}>✦</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={handleSearchPress}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={handleNotificationPress}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={16} color="#CBD5E1" />
            <View style={styles.notifPulseDot} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#08090C',
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 16,
    zIndex: 30,
  },
  appNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleColumn: {
    flex: 1,
    gap: 2,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C084FC',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  anonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  anonDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#34D399',
  },
  anonText: {
    fontSize: 9,
    color: '#34D399',
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  sparkleStar: {
    fontSize: 16,
    color: '#FBBF24',
    fontWeight: '900',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifPulseDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A855F7',
  },
});
