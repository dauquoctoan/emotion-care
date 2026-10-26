import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Lắng Nghe Cảm Xúc</Text>
          <Text style={styles.appSubtitle}>Không gian an toàn của bạn</Text>
        </View>

        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: "https://api.builder.io/api/v1/image/assets/TEMP/63ce0dce7dbe65bdc96e98a6a46a096aa7415631?width=560",
            }}
            style={styles.heroImage}
            contentFit="contain"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.mainTitle}>
            Chia sẻ cảm xúc của bạn trong vài giây
          </Text>
          <Text style={styles.description}>
            Không áp lực. Không phán xét. Giữ ẩn danh nếu bạn muốn — chỉ cần thể
            hiện cảm xúc một cách nhẹ nhàng.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => router.replace("/how-it-works")}
          >
            <Text style={styles.primaryButtonText}>Bắt Đầu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Tiếp Tục Ẩn Danh</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F3F7",
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    gap: 6,
  },
  appTitle: {
    fontFamily: "Inter",
    fontSize: 20,
    fontWeight: "700",
    color: "#5A4A6B",
    textAlign: "center",
  },
  appSubtitle: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "400",
    color: "#9B8AAB",
    textAlign: "center",
  },
  heroContainer: {
    alignItems: "center",
    marginTop: 28,
  },
  heroImage: {
    width: 280,
    height: 240,
  },
  content: {
    alignItems: "center",
    marginTop: 20,
    gap: 16,
  },
  mainTitle: {
    fontFamily: "Inter",
    fontSize: 24,
    fontWeight: "700",
    color: "#4A3D5C",
    textAlign: "center",
    lineHeight: 34,
  },
  description: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "400",
    color: "#7D6B8F",
    textAlign: "center",
    lineHeight: 26,
  },
  actions: {
    marginTop: "auto",
    paddingTop: 32,
    gap: 16,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#B8A1C9",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryButton: {
    width: "100%",
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: "#D9CFE3",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "700",
    color: "#9B8AAB",
  },
});
