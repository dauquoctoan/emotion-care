import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NearbyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.text}>Cảm xúc gần đây</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F6F3F7" },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontFamily: "Inter", fontSize: 16, color: "#9B8AAB" },
});
