import Header from "@/components/header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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

const INITIAL_POSTS: Post[] = [
  {
    id: "1",
    avatarBg: "#E8DFF0",
    avatarIcon: "🌿",
    name: "Ai đó gần đây",
    time: "3 phút trước",
    content:
      "Cảm thấy một sự biết ơn lặng lẽ hôm nay. Ánh sáng buổi sáng qua cửa sổ nhắc nhở tôi rằng những điều nhỏ bé vẫn quan trọng.",
    emotionEmoji: "🌿",
    emotionLabel: "Biết ơn",
    emotionColor: "#7C5CBF",
    location: "Khu vực Quận 1",
    selectedReaction: "amAp",
  },
  {
    id: "2",
    avatarBg: "#DFE8F5",
    avatarIcon: "😢",
    name: "~0.8 km",
    time: "23 phút trước",
    content:
      "Đôi khi gánh nặng của mọi thứ chỉ đuổi kịp bạn. Tôi ngồi trên chiếc ghế bên sông và để bản thân cảm nhận tất cả. Không sao khi không ổn. Tôi đang học điều đó từ từ.",
    emotionEmoji: "😢",
    emotionLabel: "Nặng nề",
    emotionColor: "#5B7FBA",
    location: "Khu vực Công viên Riverside",
    selectedReaction: "hoTro",
  },
  {
    id: "3",
    avatarBg: "#FEF3E2",
    avatarIcon: "☀️",
    name: "~1.6 km",
    time: "42 phút trước",
    content:
      "Làm một người lạ mỉm cười hôm nay ở quán cà phê. Thật buồn cười khi những khoảnh khắc kết nối nhỏ bé có thể thay đổi mọi thứ.",
    emotionEmoji: "☀️",
    emotionLabel: "Hy vọng",
    emotionColor: "#D4943A",
    location: "Khu vực Quận 3",
    selectedReaction: "amAp",
  },
  {
    id: "4",
    avatarBg: "#E8F5E8",
    avatarIcon: "🍃",
    name: "~0.5 km",
    time: "1 giờ trước",
    content:
      "Học cách chấp nhận sự không chắc chắn thay vì chống lại nó. Một số ngày điều đó cảm thấy như đủ tiến bộ.",
    emotionEmoji: "🍃",
    emotionLabel: "Phát triển",
    emotionColor: "#5A9A5A",
    location: "Khu vực Quận 7",
    selectedReaction: "dongCam",
  },
];

export default function ExploreScreen() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  const handleReaction = (postId: string, reaction: Reaction) => {
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
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={[0]}
      >
        <Header />
        <View style={styles.sectionHeader}>
          <IconSymbol name="list.bullet" size={14} color="#4A3D5C" />
          <Text style={styles.sectionTitle}>Cảm Xúc Gần Đây</Text>
        </View>

        {posts.map((post) => (
          <PostCard key={post.id} post={post} onReaction={handleReaction} />
        ))}
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
