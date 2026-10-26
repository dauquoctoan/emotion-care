import { updateDeviceSetting } from "@/services/api-service.ts";
import { useDeviceSetting, useDeviceStore } from "@/stores/user.store";
import { DeviceSetting } from "@/types/type";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingToggleProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

function SettingToggle({
  label,
  description,
  value,
  onValueChange,
}: SettingToggleProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextGroup}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D9D0E7", true: "#7C5CBF" }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#D9D0E7"
      />
    </View>
  );
}

interface SectionCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      <View style={styles.divider} />
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();

  const setting = useDeviceSetting();

  function updateSetting(deviceSetting: Partial<DeviceSetting>){
    const newDevice = {...setting, ...deviceSetting} as DeviceSetting
    useDeviceStore
    .getState().setSetting(newDevice);
    updateDeviceSetting(newDevice);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Text style={styles.headerBackArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài Đặt</Text>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <View style={styles.helpCircle}>
            <Text style={styles.helpIcon}>?</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heroText}>
          Không gian của bạn, nhịp độ của bạn. Các cài đặt này giúp bạn cảm thấy
          an toàn và kiểm soát. Không có gì ở đây được chia sẻ với bất kỳ ai.
        </Text>

        <SectionCard
          title="Chia Sẻ Gần Đây"
          subtitle="Chọn cách bạn kết nối với mọi người xung quanh. Bạn luôn ẩn danh."
        >
          <SettingToggle
            label="Cho phép chia sẻ gần đây"
            description="Người khác gần đây có thể thấy bài viết của bạn (không bao giờ là danh tính của bạn)"
            value={setting?.share_nearby || false}
            onValueChange={(value)=>{updateSetting({share_nearby: value})}}
          />
          <View style={styles.innerDivider} />
          <SettingToggle
            label="Nhận bài viết gần đây"
            description="Xem những gì người khác xung quanh bạn đang cảm thấy"
            value={setting?.receive_nearby||false}
            onValueChange={(value)=>{updateSetting({receive_nearby: value})}}
          />
        </SectionCard>

        <SectionCard
          title="Vị Trí Cho Nguồn Cấp"
          subtitle="Vị trí chỉ được sử dụng để hiện thị các bài viết gần đây liên quan. Nó không bao giờ được lưu trữ hoặc chia sẻ."
        >
          <SettingToggle
            label="Sử dụng vị trí cho nguồn cấp"
            description="Cá nhân hóa nguồn cấp gần đây của bạn một cách nhẹ nhàng"
            value={setting?.use_location||false}
            onValueChange={(value)=>{updateSetting({use_location: value})}}
          />
          <View style={styles.innerDivider} />
          <SettingToggle
            label="Chỉ gần đúng"
            description="Sử dụng khu vực chung, không phải vị trí chính xác của bạn"
            value={setting?.approximate_location||false}
            onValueChange={(value)=>{updateSetting({approximate_location: value})}}
          />
        </SectionCard>

        <SectionCard
          title="Tiện Nghi & AI"
          subtitle="Các tính năng này ở đây để giúp đỡ, không bao giờ gây áp lực. Tắt chúng bất cứ lúc nào."
        >
          <SettingToggle
            label="Bật gợi ý AI"
            description="Lời nhắc nhẹ nhàng để giúp bạn diễn đạt cảm xúc"
            value={setting?.ai_suggestion_enabled || false}
            onValueChange={(value)=>{updateSetting({ai_suggestion_enabled: value})}}
          />
          <View style={styles.innerDivider} />
          <SettingToggle
            label="Chế độ áp lực thấp"
            description="Giảm lời nhắc và thông báo"
            value={setting?.low_pressure_mode || false}
            onValueChange={(value)=>{updateSetting({low_pressure_mode: value})}}
          />
        </SectionCard>

        <View style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <View style={styles.shieldCircle}>
              <Text style={styles.shieldIcon}>🛡️</Text>
            </View>
            <Text style={styles.privacyTitle}>
              Quyền riêng tư của bạn quan trọng
            </Text>
          </View>
          <Text style={styles.privacyText}>
            Chăm Sóc Cảm Xúc được thiết kế cho sự tham gia ẩn danh, áp lực thấp.
            Không cần tài khoản. Không bán dữ liệu. Bạn ở đây theo điều kiện của
            riêng bạn.
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.7} style={styles.footerLink}>
          <Text style={styles.footerLinkText}>
            Xem lại thông tin giới thiệu & quyền riêng tư →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F3F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F6F3F7",
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBackArrow: {
    fontSize: 22,
    color: "#4A3D5C",
    lineHeight: 26,
  },
  headerTitle: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "600",
    color: "#4A3D5C",
  },
  helpCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: "#A89BB5",
    alignItems: "center",
    justifyContent: "center",
  },
  helpIcon: {
    fontSize: 13,
    color: "#A89BB5",
    fontWeight: "600",
    lineHeight: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  heroText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "400",
    color: "#6B5F7A",
    lineHeight: 22,
    marginBottom: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "700",
    color: "#4A3D5C",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "400",
    color: "#6B5F7A",
    lineHeight: 20,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0EBF6",
    marginBottom: 14,
  },
  innerDivider: {
    height: 1,
    backgroundColor: "#F0EBF6",
    marginVertical: 14,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  toggleTextGroup: {
    flex: 1,
  },
  toggleLabel: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "600",
    color: "#4A3D5C",
    marginBottom: 3,
  },
  toggleDescription: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400",
    color: "#A89BB5",
    lineHeight: 18,
  },
  privacyCard: {
    backgroundColor: "#EDE8F8",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  privacyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  shieldCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D8CEF0",
    alignItems: "center",
    justifyContent: "center",
  },
  shieldIcon: {
    fontSize: 16,
  },
  privacyTitle: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "700",
    color: "#4A3D5C",
    flex: 1,
    flexWrap: "wrap",
  },
  privacyText: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "400",
    color: "#6B5F7A",
    lineHeight: 20,
  },
  footerLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  footerLinkText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "400",
    color: "#7C5CBF",
    textDecorationLine: "underline",
  },
});
