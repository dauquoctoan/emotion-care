import Header from "@/components/header";
import { createEmotionPost } from "@/services/api-service.ts";
import { scheduleNotification } from "@/services/notification.service";
import { isContentReady, useContent } from "@/stores/caption.store";
import { ApiCreateEmotionPost } from "@/types/type";
import { router, useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SuggestionCardProps = {
  tone: string;
  icon: string;
  text: string;
};

function SuggestionCard({ tone, icon, text }: SuggestionCardProps) {
  const content = useContent();

  async function handleUse() {
    if (!text || !isContentReady()) return;

    const data = await createEmotionPost({
      ...content,
      content: text,
    } as ApiCreateEmotionPost);

    if (data?.data.success) {
      scheduleNotification(
        "Thành công",
        "Bạn đã tạo post trạng thái thành công!",
      );
      router.push("/(tabs)/explore");
    }
  }

  return (
    <View style={styles.suggestionCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTone}>{tone}</Text>
        <Text style={styles.cardIcon}>{icon}</Text>
      </View>
      <Text style={styles.cardText}>{text}</Text>
      <TouchableOpacity
        style={styles.useButton}
        onPress={() => {
          handleUse();
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.useButtonText}>Sử dụng</Text>
      </TouchableOpacity>
    </View>
  );
}

const SUGGESTIONS = [
  {
    id: "gentle",
    tone: "Nhẹ nhàng",
    icon: "🤍",
    text: "Không sao khi cảm thấy cả nặng nề và hy vọng cùng lúc. Hôm nay tôi đang chấp nhận cả hai.",
  },
  {
    id: "direct",
    tone: "Trực tiếp",
    icon: "⚡",
    text: "Choáng ngợp nhưng vẫn ở đây, vẫn hy vọng. Điều đó có ý nghĩa.",
  },
  {
    id: "expressive",
    tone: "Biểu cảm",
    icon: "🌤️",
    text: "Một số ngày gánh nặng là có thật, nhưng ánh sáng nhỏ mà tôi tiếp tục với tôi cũng vậy. Hôm nay tôi chọn cả hai.",
  },
];

export default function AIHelperScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={[0]}
      >
        <Header />
        <TouchableOpacity
          style={styles.backNav}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backTitle}>Trợ Giúp Chú Thích AI</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelIcon}>✏️</Text>
            <Text style={styles.sectionLabelText}>THÔNG TIN CỦA BẠN</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Cảm thấy choáng ngợp nhưng cố gắng giữ hy vọng hôm nay
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🤗 Hy vọng</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelIcon}>✏️</Text>
            <Text style={styles.sectionLabelText}>GỢI Ý CHO BẠN</Text>
          </View>
          <View style={styles.suggestionList}>
            {SUGGESTIONS.map((s) => (
              <SuggestionCard
                key={s.id}
                tone={s.tone}
                icon={s.icon}
                text={s.text}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Bỏ qua & tự viết</Text>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
    position: "relative",
  },
  backNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  backArrow: {
    fontFamily: "Inter",
    fontSize: 20,
    color: "#4A3D5C",
    lineHeight: 24,
  },
  backTitle: {
    fontFamily: "Inter",
    fontSize: 20,
    fontWeight: "700",
    color: "#4A3D5C",
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionLabelIcon: {
    fontSize: 13,
  },
  sectionLabelText: {
    fontFamily: "Inter",
    fontSize: 11,
    fontWeight: "700",
    color: "#9B8AAB",
    letterSpacing: 0.8,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#C4B5D5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  infoText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "400",
    color: "#4A3D5C",
    lineHeight: 22,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#EDE8F5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "500",
    color: "#7B5EA7",
  },
  suggestionList: {
    gap: 12,
  },
  suggestionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: "#C4B5D5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTone: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "700",
    color: "#7B5EA7",
  },
  cardIcon: {
    fontSize: 18,
  },
  cardText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "400",
    color: "#4A3D5C",
    lineHeight: 21,
  },
  useButton: {
    alignSelf: "flex-start",
    backgroundColor: "#5A3E7B",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  useButtonText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  skipText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "600",
    color: "#4A3D5C",
  },
});
