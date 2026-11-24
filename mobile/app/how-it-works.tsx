import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type StepCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
};

function StepCard({ icon, iconColor, title, description }: StepCardProps) {
  return (
    <View style={styles.stepCard}>
      <View style={[styles.iconCircle, { borderColor: `${iconColor}40`, backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.stepCardText}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );
}

type PrivacyCardProps = {
  title: string;
  description: string;
};

function PrivacyCard({ title, description }: PrivacyCardProps) {
  return (
    <View style={styles.privacyCard}>
      <View style={styles.lockCircle}>
        <Ionicons name="shield-checkmark" size={18} color="#34D399" />
      </View>
      <View style={styles.privacyCardText}>
        <Text style={styles.privacyTitle}>{title}</Text>
        <Text style={styles.privacyDescription}>{description}</Text>
      </View>
    </View>
  );
}

export default function HowItWorksScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="sparkles" size={24} color="#C084FC" />
          </View>
          <Text style={styles.mainTitle}>Cách Hoạt Động</Text>
          <Text style={styles.mainSubtitle}>
            Không áp lực. Không đăng nhập. Chỉ là câu từ & cảm xúc chân thành.
          </Text>
        </View>

        <View style={styles.stepsSection}>
          <StepCard
            icon="leaf-outline"
            iconColor="#34D399"
            title="1. Thả trôi tâm trạng"
            description="Chạm vào cảm giác lúc này của bạn — an yên, cô đơn, hy vọng hay nặng lòng."
          />
          <StepCard
            icon="color-wand-outline"
            iconColor="#C084FC"
            title="2. Studio sáng tạo & AI"
            description="Tự do viết hoặc để AI hỗ trợ gieo vần, chọn phông chữ và nền màu nghệ thuật."
          />
          <StepCard
            icon="flash-outline"
            iconColor="#FBBF24"
            title="3. Copy 1 chạm & Lan tỏa"
            description="Hàng ngàn câu trích dẫn và caption sâu sắc được cập nhật mỗi ngày để bạn chia sẻ."
          />
          <StepCard
            icon="navigate-outline"
            iconColor="#60A5FA"
            title="4. Kết nối cảm xúc quanh đây"
            description="Khám phá những người bạn gần bên (~2km) đang cảm thấy thế nào qua vòng sóng an toàn."
          />
        </View>

        <View style={styles.privacySection}>
          <PrivacyCard
            title="Tuyệt đối ẩn danh"
            description="Không cần email hay số điện thoại. Định danh gắn liền bảo mật phần cứng của máy bạn."
          />
          <PrivacyCard
            title="Vị trí làm mờ an toàn (~2km)"
            description="Tọa độ thực không bao giờ bị ghi lại. Chỉ làm mờ trong bán kính để giữ an toàn tuyệt đối."
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => {
              router.replace('/');
            }}
          >
            <Text style={styles.primaryButtonText}>
              Tôi Đã Sẵn Sàng — Bắt Đầu Thôi
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#08090C",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 24,
  },
  headerSection: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
  },
  headerIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(147, 51, 234, 0.2)",
    borderWidth: 1.5,
    borderColor: "#C084FC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  headerIconEmoji: {
    fontSize: 24,
    color: "#C084FC",
    fontWeight: "900",
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F8FAFC",
    textAlign: "center",
  },
  mainSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
  },
  stepsSection: {
    gap: 12,
  },
  stepCard: {
    backgroundColor: "#0E1017",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(192, 132, 252, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(192, 132, 252, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: 20,
  },
  stepCardText: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F8FAFC",
    lineHeight: 20,
  },
  stepDescription: {
    fontSize: 13,
    fontWeight: "400",
    color: "#94A3B8",
    lineHeight: 19,
  },
  privacySection: {
    gap: 12,
  },
  privacyCard: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  lockCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  lockEmoji: {
    fontSize: 18,
  },
  privacyCardText: {
    flex: 1,
    gap: 4,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#34D399",
    lineHeight: 20,
  },
  privacyDescription: {
    fontSize: 12,
    fontWeight: "400",
    color: "#94A3B8",
    lineHeight: 18,
  },
  actions: {
    marginTop: 8,
    alignItems: "center",
  },
  primaryButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#9333EA",
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
