import Header from '@/components/header';
import SearchModal from '@/components/search-modal';
import { updateDeviceSetting } from '@/services/api';
import { useDeviceId, useDeviceSetting, useDeviceStore } from '@/stores/user.store';
import { DeviceSetting } from '@/types/type';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LibraryTab = 'saved' | 'myPosts' | 'settings';

interface SavedItem {
  id: string;
  quote: string;
  author: string;
  tag: string;
  copyCount: number;
  savedDate: string;
}

const SAVED_ITEMS: SavedItem[] = [
  {
    id: 'save-1',
    quote: 'Đôi khi điều đẹp nhất không phải là gặp được ai đó, mà là tìm lại chính mình sau chuỗi ngày lạc lõng.',
    author: '@an_nhien',
    tag: 'Chữa Lành',
    copyCount: 3420,
    savedDate: '24 Th11, 2026',
  },
  {
    id: 'save-2',
    quote: 'Tuổi trẻ không cần phải luôn rực rỡ, chỉ cần đủ can đảm để sống theo cách mình muốn và không hối tiếc.',
    author: '@tiem_ca_phe_mua',
    tag: 'Tuổi Trẻ',
    copyCount: 924,
    savedDate: '22 Th11, 2026',
  },
  {
    id: 'save-3',
    quote: 'Có những ngày lặng lẽ đến mức tiếng mưa rơi ngoài hiên cũng hóa thành lời an ủi dịu dàng nhất.',
    author: '@mưa_đêm',
    tag: 'Bình Yên',
    copyCount: 1540,
    savedDate: '20 Th11, 2026',
  },
];

interface SettingToggleProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

function SettingToggle({ label, description, value, onValueChange }: SettingToggleProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextGroup}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(val) => {
          Haptics.selectionAsync();
          onValueChange(val);
        }}
        trackColor={{ false: '#27273A', true: '#9333EA' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<LibraryTab>('saved');
  const [savedList, setSavedList] = useState<SavedItem[]>(SAVED_ITEMS);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastOpacity = useState(new Animated.Value(0))[0];

  const deviceId = useDeviceId();
  const setting = useDeviceSetting();

  // Settings State
  const [alias, setAlias] = useState('');
  const [activeMode, setActiveMode] = useState<'DUAL_MODE' | 'EMOTION_ONLY' | 'SOCIAL_CAPTION'>('DUAL_MODE');

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

  const handleRemoveSaved = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSavedList((prev) => prev.filter((item) => item.id !== id));
    showToast('Đã xóa khỏi danh sách lưu');
  };

  const updateSetting = (deviceSetting: Partial<DeviceSetting>) => {
    const newDevice = { ...setting, ...deviceSetting } as DeviceSetting;
    useDeviceStore.getState().setSetting(newDevice);
    updateDeviceSetting(newDevice);
    showToast('Đã cập nhật cài đặt bảo mật!');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        eyebrow="BỘ SƯU TẬP CỦA BẠN"
        title="Thư Viện"
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
        {/* User Alias & Device Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarGlowCircle}>
              <Text style={styles.avatarEmoji}>✍️</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.authorAliasText}>
                @{alias.trim() ? alias.trim() : deviceId ? 'creator_' + deviceId.slice(0, 6) : 'an_nhien'}
              </Text>
              <Text style={styles.deviceIdSubtext}>
                x-device-id: {deviceId ? deviceId.slice(0, 16) + '...' : 'bảo mật phần cứng'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.settingsIconBtn, activeTab === 'settings' && styles.settingsIconBtnActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab(activeTab === 'settings' ? 'saved' : 'settings');
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'settings' ? 'close' : 'settings-outline'}
                size={18}
                color="#C084FC"
              />
            </TouchableOpacity>
          </View>

          {/* Metric Badges */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{savedList.length}</Text>
              <Text style={styles.metricLabel}>Đã lưu</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>84</Text>
              <Text style={styles.metricLabel}>Lượt copy</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>15</Text>
              <Text style={styles.metricLabel}>Đã đăng</Text>
            </View>
          </View>
        </View>

        {/* 3-Section Segment Switcher: Saved | My Posts | Settings */}
        <View style={styles.segmentWrapper}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'saved' && styles.segmentBtnActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab('saved');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'saved' && styles.segmentTextActive]}>
              🔖 Đã Lưu ({savedList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'myPosts' && styles.segmentBtnActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab('myPosts');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'myPosts' && styles.segmentTextActive]}>
              📝 Đã Đăng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'settings' && styles.segmentBtnActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab('settings');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'settings' && styles.segmentTextActive]}>
              ⚙️ Cài Đặt
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= SECTION 1: SAVED BOOKMARKS ================= */}
        {activeTab === 'saved' && (
          savedList.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <Text style={styles.emptyEmoji}>📂</Text>
              <Text style={styles.emptyTitle}>Chưa có caption nào được lưu</Text>
              <Text style={styles.emptySubtext}>
                Nhấn nút sao chép hoặc lưu trên các bài viết để lưu trữ tại đây.
              </Text>
            </View>
          ) : (
            <View style={styles.cardsStack}>
              {savedList.map((item) => (
                <View key={item.id} style={styles.savedCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardAuthorRow}>
                      <Text style={styles.cardAuthorName}>{item.author}</Text>
                      <Text style={styles.cardTagBadge}>#{item.tag}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveSaved(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color="#64748B" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.cardQuoteText}>"{item.quote}"</Text>

                  <View style={styles.cardBottomRow}>
                    <Text style={styles.cardDateText}>{item.savedDate}</Text>
                    <TouchableOpacity
                      style={styles.copySmallBtn}
                      onPress={() => handleCopy(item.quote)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="copy-outline" size={13} color="#C084FC" />
                      <Text style={styles.copySmallText}>Chép</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )
        )}

        {/* ================= SECTION 2: MY POSTS ================= */}
        {activeTab === 'myPosts' && (
          <View style={styles.emptyStateBox}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text style={styles.emptyTitle}>Mở Creator Studio để viết bài</Text>
            <Text style={styles.emptySubtext}>
              Các bài đăng từ Creator Studio sẽ được phân phối theo thuật toán và xếp hạng tại đây.
            </Text>
            <TouchableOpacity
              style={styles.ctaStudioBtn}
              onPress={() => router.push('/(tabs)/write')}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaStudioText}>Mở Creator Studio</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= SECTION 3: EMBEDDED SETTINGS ================= */}
        {activeTab === 'settings' && (
          <View style={styles.settingsStack}>
            {/* 1. Author Alias Editor */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="pencil-outline" size={17} color="#C084FC" />
                <Text style={styles.sectionTitle}>Bút Danh Sáng Tạo</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Bút danh xuất hiện cạnh các caption bạn sáng tạo và đăng tải lên cộng đồng.
              </Text>

              <View style={styles.aliasInputBox}>
                <Text style={styles.aliasPrefix}>@</Text>
                <TextInput
                  style={styles.aliasInput}
                  placeholder="nắng_chiều, tiệm_thơ..."
                  placeholderTextColor="#64748B"
                  value={alias}
                  onChangeText={setAlias}
                  maxLength={30}
                />
                <TouchableOpacity
                  style={styles.saveAliasBtn}
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    showToast(`Đã lưu bút danh: @${alias || 'an_nhien'}`);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveAliasBtnText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Dual-Mode Selector */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="layers-outline" size={17} color="#C084FC" />
                <Text style={styles.sectionTitle}>Chế Độ Hoạt Động (Dual-Mode)</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Tùy chỉnh luồng hiển thị ưu tiên giữa giải tỏa tâm sự hoặc khám phá caption viral.
              </Text>

              <View style={styles.modeOptionGroup}>
                <TouchableOpacity
                  style={[styles.modeCard, activeMode === 'DUAL_MODE' && styles.modeCardActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setActiveMode('DUAL_MODE');
                    showToast('Đã chọn Chế Độ Kép (Dual-Mode)');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.modeCardHeader}>
                    <Text style={styles.modeEmoji}>⚡</Text>
                    <Text style={[styles.modeTitle, activeMode === 'DUAL_MODE' && styles.modeTitleActive]}>
                      Chế Độ Kép (Dual-Mode)
                    </Text>
                  </View>
                  <Text style={styles.modeDesc}>Trọn vẹn cả 2 thế giới: Vừa giải tỏa tâm sự ẩn danh, vừa lan tỏa caption hay.</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeCard, activeMode === 'EMOTION_ONLY' && styles.modeCardActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setActiveMode('EMOTION_ONLY');
                    showToast('Đã chọn Chế Độ Chữa Lành Thuần Túy');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.modeCardHeader}>
                    <Text style={styles.modeEmoji}>🌿</Text>
                    <Text style={[styles.modeTitle, activeMode === 'EMOTION_ONLY' && styles.modeTitleActive]}>
                      Chữa Lành Thuần Túy
                    </Text>
                  </View>
                  <Text style={styles.modeDesc}>Tập trung vào trút bầu tâm sự, không số đếm, tự biến mất sau 7 ngày.</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeCard, activeMode === 'SOCIAL_CAPTION' && styles.modeCardActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setActiveMode('SOCIAL_CAPTION');
                    showToast('Đã chọn Chế Độ Caption Sáng Tạo');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.modeCardHeader}>
                    <Text style={styles.modeEmoji}>🔥</Text>
                    <Text style={[styles.modeTitle, activeMode === 'SOCIAL_CAPTION' && styles.modeTitleActive]}>
                      Caption Sáng Tạo
                    </Text>
                  </View>
                  <Text style={styles.modeDesc}>Ưu tiên bảng xếp hạng trending, copy 1 chạm và studio AI.</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Location Privacy */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="location-outline" size={17} color="#C084FC" />
                <Text style={styles.sectionTitle}>Quyền Riêng Tư & Vị Trí</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Vị trí chỉ dùng để kết nối những tâm hồn đồng điệu xung quanh bạn.
              </Text>

              <SettingToggle
                label="Sử dụng vị trí cho nguồn cấp"
                description="Xem những gì người khác xung quanh bạn đang cảm thấy"
                value={setting?.use_location ?? true}
                onValueChange={(val) => updateSetting({ use_location: val })}
              />
              <View style={styles.innerDivider} />
              <SettingToggle
                label="Bán kính xấp xỉ (~2km)"
                description="Làm mờ tọa độ chính xác để bảo vệ an toàn tối đa"
                value={setting?.approximate_location ?? true}
                onValueChange={(val) => updateSetting({ approximate_location: val })}
              />
              <View style={styles.innerDivider} />
              <SettingToggle
                label="Chia sẻ gần đây"
                description="Cho phép người khác quanh khu vực đọc bài của bạn"
                value={setting?.share_nearby ?? true}
                onValueChange={(val) => updateSetting({ share_nearby: val })}
              />
            </View>

            {/* 4. Comfort & AI */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="color-wand-outline" size={17} color="#C084FC" />
                <Text style={styles.sectionTitle}>Tiện Nghi & Trợ Lý AI</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Các tính năng đồng hành nhẹ nhàng, không gây áp lực xã hội.
              </Text>

              <SettingToggle
                label="Gợi ý cảm xúc AI"
                description="Hiển thị nút hỗ trợ gieo vần và diễn đạt câu từ"
                value={setting?.ai_suggestion_enabled ?? true}
                onValueChange={(val) => updateSetting({ ai_suggestion_enabled: val })}
              />
              <View style={styles.innerDivider} />
              <SettingToggle
                label="Chế độ áp lực thấp (Low Pressure)"
                description="Tắt toàn bộ thông báo nhắc nhở và số lượng tương tác"
                value={setting?.low_pressure_mode ?? false}
                onValueChange={(val) => updateSetting({ low_pressure_mode: val })}
              />
            </View>

            {/* 5. Privacy Guarantee Card */}
            <View style={styles.privacyCard}>
              <View style={styles.shieldRow}>
                <Ionicons name="shield-checkmark" size={18} color="#34D399" />
                <Text style={styles.privacyTitle}>Bảo Chứng Riêng Tư 100%</Text>
              </View>
              <Text style={styles.privacyText}>
                Emotion Care xây dựng trên nguyên tắc Không Tài Khoản — Không Đăng Nhập — Không Bán Dữ Liệu. Danh tính gắn liền với thiết bị phần cứng của bạn và không thể bị truy vết.
              </Text>
            </View>
          </View>
        )}

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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 16,
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
  profileCard: {
    backgroundColor: '#0E1017',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 16,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarGlowCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderWidth: 1.5,
    borderColor: '#C084FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  authorAliasText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  deviceIdSubtext: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  settingsIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIconBtnActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  segmentWrapper: {
    flexDirection: 'row',
    backgroundColor: '#0E1017',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },
  segmentBtnActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  cardsStack: {
    gap: 12,
  },
  savedCard: {
    backgroundColor: '#0E1017',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardAuthorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C084FC',
  },
  cardTagBadge: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  cardQuoteText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#F1F5F9',
    fontStyle: 'italic',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardDateText: {
    fontSize: 11,
    color: '#64748B',
  },
  copySmallBtn: {
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
  copySmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C084FC',
  },
  emptyStateBox: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  ctaStudioBtn: {
    marginTop: 12,
    backgroundColor: '#9333EA',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
  },
  ctaStudioText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsStack: {
    gap: 14,
  },
  sectionCard: {
    backgroundColor: '#0E1017',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 17,
    marginBottom: 12,
  },
  aliasInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  aliasPrefix: {
    fontSize: 14,
    fontWeight: '800',
    color: '#C084FC',
    marginRight: 2,
  },
  aliasInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    paddingVertical: 6,
  },
  saveAliasBtn: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  saveAliasBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modeOptionGroup: {
    gap: 8,
  },
  modeCard: {
    backgroundColor: '#161925',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 4,
  },
  modeCardActive: {
    borderColor: '#C084FC',
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
  },
  modeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeEmoji: {
    fontSize: 16,
  },
  modeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  modeTitleActive: {
    color: '#C084FC',
    fontWeight: '800',
  },
  modeDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  innerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleTextGroup: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 15,
  },
  privacyCard: {
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    gap: 6,
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  privacyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34D399',
  },
  privacyText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
});
