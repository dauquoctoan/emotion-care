import Header from '@/components/header';
import { updateDeviceSetting } from '@/services/api';
import { useDeviceId, useDeviceSetting, useDeviceStore } from '@/stores/user.store';
import { DeviceSetting } from '@/types/type';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function SettingsScreen() {
  const router = useRouter();
  const deviceId = useDeviceId();
  const setting = useDeviceSetting();
  const [alias, setAlias] = useState('');
  const [activeMode, setActiveMode] = useState<'DUAL_MODE' | 'EMOTION_ONLY' | 'SOCIAL_CAPTION'>('DUAL_MODE');
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

  const updateSetting = (deviceSetting: Partial<DeviceSetting>) => {
    const newDevice = { ...setting, ...deviceSetting } as DeviceSetting;
    useDeviceStore.getState().setSetting(newDevice);
    updateDeviceSetting(newDevice);
  };

  const copyDeviceId = async () => {
    if (deviceId) {
      await Clipboard.setStringAsync(deviceId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Đã chép ID ẩn danh vào bộ nhớ tạm');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="CÀI ĐẶT ỨNG DỤNG" showBack={true} />

      {/* Floating Micro-Toast */}
      {toastMessage && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <Text style={styles.toastEmoji}>✨</Text>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Identity & Hardware ID Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileTopRow}>
              <View style={styles.avatarGlowCircle}>
                <Ionicons name="finger-print-outline" size={24} color="#C084FC" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.badgeRow}>
                  <Text style={styles.verifiedBadge}>BẢO MẬT PHẦN CỨNG</Text>
                  <Text style={styles.privateText}>🟢 Ẩn Danh Tuyệt Đối</Text>
                </View>
                <Text style={styles.profileName}>Thiết Bị Của Bạn</Text>
              </View>
            </View>

            <View style={styles.idDisplayBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.idLabel}>ĐỊNH DANH PHẦN CỨNG (X-DEVICE-ID)</Text>
                <Text style={styles.idValue} numberOfLines={1}>
                  {deviceId || 'Đang tạo danh tính mã hóa...'}
                </Text>
              </View>
              <TouchableOpacity style={styles.copyIdBtn} onPress={copyDeviceId} activeOpacity={0.7}>
                <Ionicons name="copy-outline" size={13} color="#C084FC" />
                <Text style={styles.copyIdBtnText}>Chép</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 1. Author Alias Configuration */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="pencil-outline" size={17} color="#C084FC" />
              <Text style={styles.sectionTitle}>Bút Danh Sáng Tạo</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Khi đăng tải caption hoặc câu trích dẫn, bút danh này sẽ xuất hiện cùng bài viết thay vì ID vô danh.
            </Text>

            <View style={styles.aliasInputBox}>
              <Text style={styles.aliasPrefix}>@</Text>
              <TextInput
                style={styles.aliasInput}
                placeholder="nang_chieu, tiem_tho_dem..."
                placeholderTextColor="#64748B"
                value={alias}
                onChangeText={setAlias}
                maxLength={30}
              />
              {alias.length > 0 && (
                <TouchableOpacity
                  style={styles.saveAliasBtn}
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    showToast(`Đã lưu bút danh @${alias}`);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveAliasBtnText}>Lưu</Text>
                </TouchableOpacity>
              )}
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
                  showToast('Đã bật Chế Độ Kép (Dual-Mode)');
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

          {/* 3. Location Privacy Settings */}
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
              onValueChange={(value) => updateSetting({ use_location: value })}
            />
            <View style={styles.innerDivider} />
            <SettingToggle
              label="Bán kính xấp xỉ (~2km)"
              description="Làm mờ tọa độ chính xác để bảo vệ an toàn tối đa"
              value={setting?.approximate_location ?? true}
              onValueChange={(value) => updateSetting({ approximate_location: value })}
            />
            <View style={styles.innerDivider} />
            <SettingToggle
              label="Chia sẻ gần đây"
              description="Cho phép người khác quanh khu vực đọc bài của bạn"
              value={setting?.share_nearby ?? true}
              onValueChange={(value) => updateSetting({ share_nearby: value })}
            />
          </View>

          {/* 4. AI & Wellness Settings */}
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
              description="Hiển thị nút hỗ trợ gieo vần và diễn đạt câu chữ"
              value={setting?.ai_suggestion_enabled ?? true}
              onValueChange={(value) => updateSetting({ ai_suggestion_enabled: value })}
            />
            <View style={styles.innerDivider} />
            <SettingToggle
              label="Chế độ áp lực thấp (Low Pressure)"
              description="Tắt toàn bộ thông báo nhắc nhở và số lượng tương tác"
              value={setting?.low_pressure_mode ?? false}
              onValueChange={(value) => updateSetting({ low_pressure_mode: value })}
            />
          </View>

          {/* 5. Privacy Guarantee Card */}
          <View style={styles.privacyCard}>
            <View style={styles.shieldRow}>
              <Ionicons name="shield-checkmark" size={18} color="#34D399" />
              <Text style={styles.privacyTitle}>Bảo Chứng Riêng Tư 100%</Text>
            </View>
            <Text style={styles.privacyText}>
              Emotion Care được xây dựng dựa trên triết lý Không Tài Khoản — Không Đăng Nhập — Không Bán Dữ Liệu. Danh tính gắn liền với thiết bị phần cứng của bạn và không thể bị truy vết.
            </Text>
          </View>

          <View style={{ height: 40 }} />
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  verifiedBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C084FC',
    letterSpacing: 0.5,
  },
  privateText: {
    fontSize: 10,
    color: '#34D399',
    fontWeight: '600',
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  idDisplayBox: {
    backgroundColor: '#08090C',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  idLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  idValue: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#94A3B8',
    fontWeight: '600',
  },
  copyIdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.25)',
  },
  copyIdBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C084FC',
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
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 14,
  },
  modeOptionGroup: {
    gap: 10,
  },
  modeCard: {
    backgroundColor: '#121520',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 4,
  },
  modeCardActive: {
    borderColor: '#C084FC',
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
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
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  modeTitleActive: {
    color: '#C084FC',
    fontWeight: '700',
  },
  modeDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  aliasInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#08090C',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  aliasPrefix: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C084FC',
  },
  aliasInput: {
    flex: 1,
    fontSize: 14,
    color: '#F8FAFC',
    padding: 0,
  },
  saveAliasBtn: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveAliasBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  innerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 12,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  privacyCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    gap: 8,
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34D399',
  },
  privacyText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
});
