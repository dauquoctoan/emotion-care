import Header from "@/components/header";
import { useFetch } from "@/hooks/use-fetch";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { createEmotionPost } from "@/services/api-service.ts";
import { getDeviceId, getOrCreateDeviceId } from "@/services/device-id.service";
import { setContent } from "@/stores/caption.store";
import { getCurrentLocation } from "@/ultils";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return <WriteScreen />;
}

export type IMood = {
  id: number;
  code: string;
  icon: string;
  name: string;
  display_order: number;
};

const DEFAULT_DATA = Array.from({ length: 6 }).map((_, index) => ({
  id: index,
  code: index.toString(),
  icon: "",
  name: "...",
  display_order: index,
}));

export function WriteScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<IMood>();
  const [note, setNote] = useState("");
  const [isRequired, setIsRequired] = useState<Boolean>();

  const { data: mood } = useFetch<IMood[]>("/api/v1/categories", DEFAULT_DATA);

  const { scheduleNotification } = useNotificationActions();

  async function handlePostEmotions() {
    if (!note || !selectedMood) {
      setIsRequired(true);
      return;
    }

    const deviceId = await getDeviceId();
    const location = await getCurrentLocation();

    if (!deviceId || !location.latitude || !location.longitude) {
      return;
    }

    const data = await createEmotionPost({
      device_id: deviceId,
      content: note,
      is_ai_assisted: false,
      emotion_category_id: selectedMood.id,
      city: location.city || "",
      district: location.district || "",
      latitude: location.latitude,
      longitude: location.longitude,
      code: selectedMood.code
    });

    if (data?.data.success) {
      scheduleNotification(
        "Thành công",
        "Bạn đã tạo post trạng thái thành công!",
      );

      router.push("/(tabs)/explore");
    }
  }

  async function handlePushAiGen() {
    if (!selectedMood) return;

    const deviceId = await getOrCreateDeviceId();
    const location = await getCurrentLocation();

    setContent({
      device_id: deviceId,
      is_ai_assisted: false,
      emotion_category_id: selectedMood.id,
      city: location.city || "",
      district: location.district || "",
      latitude: location.latitude,
      longitude: location.longitude,
      code: selectedMood.code
    });

    router.push("/write");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={[0]}
      >
        <Header />

        <View style={styles.titleSection}>
          <Text style={styles.question}>Bạn đang cảm thấy thế nào?</Text>
          <Text style={styles.subtitle}>
            Chạm vào tâm trạng — chỉ mất một chút thời gian
          </Text>
        </View>

        <View style={styles.moodGrid}>
          {mood?.map((mood) => {
            const selected = selectedMood?.id === mood.id;
            return (
              <TouchableOpacity
                key={mood.code}
                style={[styles.moodCard, selected && styles.moodCardSelected]}
                activeOpacity={0.75}
                onPress={() => setSelectedMood(mood)}
              >
                <Text style={styles.moodEmoji}>{mood.icon}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    selected && styles.moodLabelSelected,
                  ]}
                >
                  {mood.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.inputSection}>
          <TextInput
            style={styles.textInput}
            placeholder="Nói thêm một chút (tùy chọn)..."
            placeholderTextColor="#B8A9C8"
            value={note}
            onChangeText={setNote}
            multiline
            onFocus={() => {
              setIsRequired(false);
            }}
          />
          {isRequired && (
            <Text style={styles.labelRequiredInput}>
              Bạn hãy mô tả cho cảm xúc của mình.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.aiButton}
          activeOpacity={0.8}
          onPress={handlePushAiGen}
        >
          <Text style={styles.aiButtonText}>
            Để AI giúp diễn đạt cảm xúc này
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePostEmotions}
          style={styles.shareButton}
          activeOpacity={0.85}
        >
          <Text style={styles.shareButtonText}>Chia Sẻ Cảm Xúc</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🔒 Ẩn danh • An toàn • Tức thì</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bellIcon: {
    width: 18,
    height: 18,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F3F7",
    position: "relative",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontFamily: "Inter",
    fontSize: 16,
    color: "#9B8AAB",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#F6F3F7",
  },
  headerIcon: {
    width: 20,
    height: 20,
  },
  headerIconText: {
    fontSize: 20,
  },
  headerTitle: {
    fontFamily: "Inter",
    fontSize: 17,
    fontWeight: "700",
    color: "#4A3D5C",
  },
  titleSection: {
    gap: 6,
  },
  question: {
    fontFamily: "Inter",
    fontSize: 22,
    fontWeight: "700",
    color: "#4A3D5C",
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "400",
    color: "#9B8AAB",
    lineHeight: 20,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  moodCard: {
    width: "30%",
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#C4B5D5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodCardSelected: {
    borderColor: "#7B5EA7",
    backgroundColor: "#FAF7FF",
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodLabel: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "500",
    color: "#4A3D5C",
    textAlign: "center",
  },
  moodLabelSelected: {
    color: "#7B5EA7",
    fontWeight: "700",
  },
  inputSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2D9EE",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
    justifyContent: "center",
  },
  labelRequiredInput: {
    color: "red",
  },
  textInput: {
    fontFamily: "Inter",
    fontSize: 15,
    color: "#4A3D5C",
    padding: 0,
    margin: 0,
  },
  aiButton: {
    backgroundColor: "#EDE8F5",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C9BBDF",
  },
  aiButtonText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "600",
    color: "#7B5EA7",
  },
  shareButton: {
    backgroundColor: "#5A3E7B",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 4,
  },
  footerText: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400",
    color: "#9B8AAB",
  },
});
