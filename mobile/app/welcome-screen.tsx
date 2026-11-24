import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>100% ẨN DANH & BẢO MẬT</Text>
          </View>
          <Text style={styles.appTitle}>Words Matter ✦</Text>
          <Text style={styles.appSubtitle}>Không Gian Cảm Xúc & Caption Sáng Tạo</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroGlowCircle}>
            <Ionicons name="sparkles" size={28} color="#C084FC" />
          </View>
          <Text style={styles.heroQuote}>
            “Nơi bạn có thể tự do trải lòng, gom nhặt những câu từ chữa lành và tìm thấy sự đồng điệu giữa hàng vạn tâm hồn.”
          </Text>
          <Text style={styles.heroAuthor}>— Emotion Care Platform</Text>
        </View>

        <View style={styles.featurePills}>
          <View style={styles.featurePill}>
            <Ionicons name="shield-checkmark-outline" size={13} color="#34D399" />
            <Text style={styles.featurePillText}>Không Cần Tài Khoản</Text>
          </View>
          <View style={styles.featurePill}>
            <Ionicons name="location-outline" size={13} color="#60A5FA" />
            <Text style={styles.featurePillText}>Vị Trí Mờ ~2km</Text>
          </View>
          <View style={styles.featurePill}>
            <Ionicons name="flash-outline" size={13} color="#FBBF24" />
            <Text style={styles.featurePillText}>Copy 1 Chạm</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.replace("/how-it-works")}
          >
            <Text style={styles.primaryButtonText}>Khám Phá Cách Hoạt Động</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.secondaryButtonText}>Bắt Đầu Ngay (Ẩn Danh)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#08090C",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0E1017",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(192, 132, 252, 0.25)",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#C084FC",
    letterSpacing: 0.6,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#F8FAFC",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94A3B8",
    textAlign: "center",
  },
  heroCard: {
    backgroundColor: "#0E1017",
    borderRadius: 24,
    padding: 24,
    marginTop: 36,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    gap: 16,
    shadowColor: "#C084FC",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  heroGlowCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(147, 51, 234, 0.2)",
    borderWidth: 1.5,
    borderColor: "#C084FC",
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmoji: {
    fontSize: 28,
  },
  heroQuote: {
    fontFamily: "serif",
    fontSize: 16,
    lineHeight: 26,
    color: "#E2E8F0",
    textAlign: "center",
    fontStyle: "italic",
  },
  heroAuthor: {
    fontSize: 12,
    fontWeight: "600",
    color: "#C084FC",
    letterSpacing: 0.5,
  },
  featurePills: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    flexWrap: "wrap",
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#0E1017",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  featurePillEmoji: {
    fontSize: 12,
  },
  featurePillText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  actions: {
    marginTop: "auto",
    paddingTop: 32,
    gap: 12,
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
  },
  secondaryButton: {
    width: "100%",
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "#0E1017",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E2E8F0",
  },
});
