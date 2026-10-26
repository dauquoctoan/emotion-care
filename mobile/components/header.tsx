import { BlurView } from 'expo-blur';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  return (
    <View style={styles.header}>
      <BlurView
        intensity={60}
        tint="light"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 28,
          paddingHorizontal: 10,
          paddingVertical: 10,
          width: 'auto',
          overflow: 'hidden'
        }}
      >
        <TouchableOpacity
          onPress={() => {
            router.push("/settings");
          }}
          style={styles.headerIcon}
          activeOpacity={0.7}
        >
          <Image
            source={require("./../assets/images/rectangle.png")}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </BlurView>

      <BlurView
        intensity={60}
        tint="light"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 28,
          paddingHorizontal: 10,
          paddingVertical: 10,
          width: 'auto',
          overflow: 'hidden'
        }}
      >
        <Text style={styles.headerTitle}>Chăm Sóc Cảm Xúc</Text>
      </BlurView>

      <BlurView
        intensity={60}
        tint="light"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 28,
          paddingHorizontal: 10,
          paddingVertical: 10,
          width: 'auto',
          overflow: 'hidden'
        }}
      >
        <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
          <Image
            source={require("./../assets/images/notification.png")}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </BlurView>

      <LinearGradient
        colors={["rgba(246,243,247,1)", "rgba(246,243,247,0)"]}
        style={styles.headerFade}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingVertical: 14,
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
  },
  headerFade: {
    height: 25,
    width: 500,
    position: "absolute",
    top: 0,
    right: 0,
  },
  headerIcon: {
    width: 22,
    height: 22,
  },
  headerTitle: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "400",
    color: "#4A3D5C",
    flex: 1,
    textAlign: "center",
  },
});
