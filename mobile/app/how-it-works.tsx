import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type StepCardProps = {
  icon: string;
  title: string;
  description: string;
};

function StepCard({ icon, title, description }: StepCardProps) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconEmoji}>{icon}</Text>
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
        <Text style={styles.lockEmoji}>🔒</Text>
      </View>
      <View style={styles.privacyCardText}>
        <Text style={styles.privacyTitle}>{title}</Text>
        <Text style={styles.privacyDescription}>{description}</Text>
      </View>
    </View>
  );
}

type Props = {
  onStart?: () => void;
};

export default function HowItWorksScreen({ onStart }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.headerIconCircle}>
            <Text style={styles.headerIconEmoji}>🤍</Text>
          </View>
          <Text style={styles.mainTitle}>Đây là cách hoạt động</Text>
          <Text style={styles.mainSubtitle}>
            Không áp lực. Không cần hồ sơ. Chỉ là cảm xúc, được chia sẻ nhẹ
            nhàng.
          </Text>
        </View>

        <View style={styles.stepsSection}>
          <StepCard
            icon="😊"
            title="Chọn tâm trạng"
            description="Chạm vào cảm giác của bạn ngay bây giờ — vui vẻ, nặng nề, hy vọng, hoặc bất cứ điều gì ở giữa."
          />
          <StepCard
            icon="✏️"
            title="Viết ghi chú (nếu bạn muốn)"
            description="Thêm vài từ về những gì bạn đang nghĩ. Hoàn toàn tùy chọn — chỉ tâm trạng của bạn là đủ."
          />
          <StepCard
            icon="✨"
            title="Để AI giúp bạn diễn đạt"
            description="Khó tìm từ ngữ? AI của chúng tôi nhẹ nhàng gợi ý cách diễn đạt cảm xúc của bạn."
          />
          <StepCard
            icon="🧭"
            title="Xem bài viết cảm xúc gần đây"
            description="Khám phá cảm giác của những người xung quanh bạn. Bạn không bao giờ cô đơn trong những gì bạn trải nghiệm."
          />
        </View>

        <View style={styles.privacySection}>
          <PrivacyCard
            title="Luôn giữ ẩn danh"
            description="Không cần đăng ký. Không tên, không ảnh, không hồ sơ. Chia sẻ tự do với sự đảm bảo không ai biết đó là bạn."
          />
          <PrivacyCard
            title="Về vị trí của bạn"
            description="Chúng tôi chỉ sử dụng vị trí của bạn để hiển thị các bài viết cảm xúc gần đây. Nó không bao giờ được lưu trữ chính xác, không bao giờ được chia sẻ, và bạn có thể điều chỉnh bất cứ lúc nào."
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={()=>{router.replace('/')}}
          >
            <Text style={styles.primaryButtonText}>
              Tôi đã sẵn sàng — bắt đầu thôi
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
    backgroundColor: "#F6F3F7",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
    gap: 24,
  },
  headerSection: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 8,
  },
  headerIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#7B5EA7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  headerIconEmoji: {
    fontSize: 26,
  },
  mainTitle: {
    fontFamily: "Inter",
    fontSize: 22,
    fontWeight: "700",
    color: "#4A3D5C",
    textAlign: "center",
  },
  mainSubtitle: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "400",
    color: "#7D6B8F",
    textAlign: "center",
    lineHeight: 22,
  },
  stepsSection: {
    gap: 12,
  },
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    shadowColor: "#C4B5D5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EDE8F5",
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
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "700",
    color: "#4A3D5C",
    lineHeight: 20,
  },
  stepDescription: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "400",
    color: "#7D6B8F",
    lineHeight: 19,
  },
  privacySection: {
    gap: 12,
  },
  privacyCard: {
    backgroundColor: "#EDE8F5",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  lockCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5C842",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  lockEmoji: {
    fontSize: 20,
  },
  privacyCardText: {
    flex: 1,
    gap: 4,
  },
  privacyTitle: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "700",
    color: "#4A3D5C",
    lineHeight: 20,
  },
  privacyDescription: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "400",
    color: "#7D6B8F",
    lineHeight: 19,
  },
  actions: {
    gap: 16,
    alignItems: "center",
  },
  primaryButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#5A3E7B",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
