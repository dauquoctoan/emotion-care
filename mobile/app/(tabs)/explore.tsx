import Header from "@/components/header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useFetch } from "@/hooks/use-fetch";
import { reactToEmotionPost } from "@/services/api";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Reaction = "amAp" | "hoTro" | "dongCam" | null;

interface Post {
  id: string;
  avatarBg: string;
  avatarIcon: string;
  name: string;
  time: string;
  content: string;
  emotionEmoji: string;
  emotionLabel: string;
  emotionColor: string;
  location: string;
  selectedReaction: Reaction;
}

const EMOJI_MAP: Record<string, { emoji: string; color: string; bg: string }> = {
  happy: { emoji: "😊", color: "#D4943A", bg: "#FEF3E2" },
  sad: { emoji: "😢", color: "#5B7FBA", bg: "#DFE8F5" },
  tired: { emoji: "😴", color: "#7C5CBF", bg: "#E8DFF0" },
  stressed: { emoji: "😰", color: "#DC2626", bg: "#FEE2E2" },
  lonely: { emoji: "🥺", color: "#6366F1", bg: "#E0E7FF" },
  excited: { emoji: "🤩", color: "#F97316", bg: "#FFEDD5" },
};

function formatTime(createdAt?: string): string {
  if (!createdAt) return "Vừa xong";
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${Math.floor(diffHours / 24)} ngày trước`;
}

export default function ExploreScreen() {
  const { data: apiPosts, loading, refetch } = useFetch<any[]>("/posts?page=0&size=20", []);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (apiPosts && apiPosts.length > 0) {
      const mapped: Post[] = apiPosts.map((item: any) => {
        const meta = EMOJI_MAP[item.emotion_category_code] || {
          emoji: "🌿",
          color: "#7C5CBF",
          bg: "#E8DFF0",
        };
        const loc = [item.district, item.city].filter(Boolean).join(", ") || "Khu vực lân cận";

        let reactionKey: Reaction = null;
        if (item.user_reaction_id === 1) reactionKey = "amAp";
        else if (item.user_reaction_id === 2) reactionKey = "dongCam";
        else if (item.user_reaction_id === 3) reactionKey = "hoTro";

        return {
          id: item.id,
          avatarBg: meta.bg,
          avatarIcon: meta.emoji,
          name: "Ai đó gần đây",
          time: formatTime(item.created_at),
          content: item.content,
          emotionEmoji: meta.emoji,
          emotionLabel: item.emotion_category_name || "Cảm xúc",
          emotionColor: meta.color,
          location: loc,
          selectedReaction: reactionKey,
        };
      });
      setPosts(mapped);
    }
  }, [apiPosts]);

  const handleReaction = async (postId: string, reaction: Reaction) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              selectedReaction:
                p.selectedReaction === reaction ? null : reaction,
            }
          : p,
      ),
    );

    const typeIdMap: Record<string, number> = {
      amAp: 1,
      dongCam: 2,
      hoTro: 3,
    };
    if (reaction) {
      try {
        await reactToEmotionPost(postId, typeIdMap[reaction] || 1);
      } catch (err) {
        console.log("Failed to react:", err);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        <Header />
        <View style={styles.sectionHeader}>
          <IconSymbol name="list.bullet" size={14} color="#4A3D5C" />
          <Text style={styles.sectionTitle}>Cảm Xúc Gần Đây</Text>
        </View>

        {loading && posts.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator size="small" color="#7C5CBF" />
          </View>
        ) : posts.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: "#8E82A0", fontSize: 14 }}>Chưa có trạng thái nào gần đây</Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onReaction={handleReaction} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PostCard({
  post,
  onReaction,
}: {
  post: Post;
  onReaction: (id: string, reaction: Reaction) => void;
}) {
  const reactions: { key: Reaction; label: string }[] = [
    { key: "amAp", label: "Ấm áp" },
    { key: "hoTro", label: "Hỗ trợ" },
    { key: "dongCam", label: "Đồng cảm" },
  ];

  const navigateToDetail = () => {
    router.push({
      pathname: "/detail/[id]",
      params: {
        id: post.id,
        emoji: post.emotionEmoji,
        content: post.content,
        location: post.location,
        time: post.time,
      },
    });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={navigateToDetail}
        activeOpacity={0.85}
        style={styles.cardPressable}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: post.avatarBg }]}>
            <Text style={styles.avatarEmoji}>{post.avatarIcon}</Text>
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.authorName}>{post.name}</Text>
            <Text style={styles.timeText}>{post.time}</Text>
          </View>
        </View>

        <Text style={styles.contentText}>{post.content}</Text>

        <View style={styles.emotionTag}>
          <Text style={[styles.emotionText, { color: post.emotionColor }]}>
            {post.emotionEmoji} {post.emotionLabel}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={styles.reactionsRow}>
        {reactions.map((r) => (
          <TouchableOpacity
            key={r.key}
            onPress={() => onReaction(post.id, r.key)}
            style={styles.reactionButton}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.reactionLabel,
                post.selectedReaction === r.key && styles.reactionLabelActive,
              ]}
            >
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F3F7",
  },
  bellIcon: {
    width: 18,
    height: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "700",
    color: "#4A3D5C",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
    position: "relative",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  cardPressable: {
    padding: 16,
    paddingBottom: 0,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 14,
  },
  cardMeta: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorName: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400",
    color: "#6B5F7A",
  },
  timeText: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400",
    color: "#A89BB5",
  },
  contentText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "400",
    color: "#4A3D5C",
    lineHeight: 24,
    marginBottom: 12,
  },
  emotionTag: {
    marginBottom: 12,
  },
  emotionText: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0EBF6",
    marginBottom: 10,
    marginTop: 12,
  },
  reactionsRow: {
    flexDirection: "row",
    gap: 24,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  reactionButton: {
    paddingVertical: 2,
  },
  reactionLabel: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "400",
    color: "#A89BB5",
  },
  reactionLabelActive: {
    color: "#7C5CBF",
    fontWeight: "500",
  },
});
