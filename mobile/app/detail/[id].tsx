import { reactToEmotionPost } from "@/services/api";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Reaction = "toiHieuBan" | "guiTinhYeu" | "hoTro" | null;

const REACTIONS: { key: Reaction; icon: string; label: string }[] = [
  { key: "toiHieuBan", icon: "thumb-up", label: "Tôi hiểu bạn" },
  { key: "guiTinhYeu", icon: "favorite", label: "Gửi tình yêu" },
  { key: "hoTro", icon: "volunteer-activism", label: "Hỗ trợ" },
];

export default function ExploreDetailScreen() {
  const { emoji, content, location, time, id } = useLocalSearchParams<{
    emoji: string;
    content: string;
    location: string;
    time: string;
    id: string;
  }>();

  const [selectedReaction, setSelectedReaction] = useState<Reaction>(null);

  const handleReaction = async (reaction: Reaction) => {
    const nextReaction = selectedReaction === reaction ? null : reaction;
    setSelectedReaction(nextReaction);
    if (id) {
      const typeIdMap: Record<string, number> = {
        toiHieuBan: 1,
        guiTinhYeu: 2,
        hoTro: 3,
      };
      const reactionTypeId = (reaction && typeIdMap[reaction]) || 1;
      try {
        await reactToEmotionPost(id, reactionTypeId);
      } catch (err) {
        console.log("Failed to react to post:", err);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back-ios" size={18} color="#4A3D5C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chăm Sóc Cảm Xúc</Text>
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="home" size={22} color="#4A3D5C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.locationPillWrap}>
          <View style={styles.locationPill}>
            <Text style={styles.locationText}>
              📍 {location ?? "Khu vực gần đây"}
            </Text>
          </View>

          <Text style={styles.timeText}> · {time ?? ""}</Text>
        </View>

        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji ?? "😢"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.contentText}>{content ?? ""}</Text>
        </View>

        <Text style={styles.reactionPrompt}>
          Điều này khiến bạn cảm thấy thế nào?
        </Text>

        <View style={styles.reactionsRow}>
          {REACTIONS.map((r) => {
            const isActive = selectedReaction === r.key;
            return (
              <View key={r.key} style={styles.reactionItem}>
                <TouchableOpacity
                  style={[
                    styles.reactionCircle,
                    isActive && styles.reactionCircleActive,
                  ]}
                  onPress={() => handleReaction(r.key)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={r.icon as any}
                    size={20}
                    color={isActive ? "#7C5CBF" : "#9A8EA8"}
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    styles.reactionLabel,
                    isActive && styles.reactionLabelActive,
                  ]}
                >
                  {r.label}
                </Text>
              </View>
            );
          })}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "400",
    color: "#4A3D5C",
    flex: 1,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: "flex-start",
  },
  locationPillWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDE8F2",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 52,
    alignSelf: "flex-start",
  },
  locationText: {
    fontFamily: "Inter",
    fontSize: 12,
    color: "#7C5CBF",
    lineHeight: 15,
  },
  timeText: {
    fontFamily: "Inter",
    fontSize: 12,
    color: "#9A8EA8",
    lineHeight: 15,
  },
  emojiContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 28,
  },
  emoji: {
    fontSize: 60,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
    marginBottom: 48,
    width: "100%",
  },
  contentText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "400",
    color: "#4A3D5C",
    lineHeight: 26,
    textAlign: "center",
  },
  reactionPrompt: {
    fontFamily: "Inter",
    fontSize: 12,
    color: "#9A8EA8",
    textAlign: "center",
    marginBottom: 20,
    alignSelf: "center",
  },
  reactionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    alignSelf: "center",
  },
  reactionItem: {
    alignItems: "center",
    gap: 8,
  },
  reactionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  reactionCircleActive: {
    backgroundColor: "#EDE8F2",
  },
  reactionLabel: {
    fontFamily: "Inter",
    fontSize: 12,
    color: "#9A8EA8",
  },
  reactionLabelActive: {
    color: "#7C5CBF",
  },
});
