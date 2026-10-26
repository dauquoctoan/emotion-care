import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useInitApp } from "@/hooks/use-init-app";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { requestPermission } from "@/services/notification.service";
import { getCurrentLocation } from "@/ultils";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isReady } = useInitApp();

  useEffect(() => {
    requestPermission();
    getCurrentLocation();
  }, []);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#EDE8F8",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NotificationProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false, headerTransparent: true }}
          />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="detail" options={{ headerShown: false }} />
          <Stack.Screen
            name="how-it-works"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="welcome-screen"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </NotificationProvider>
  );
}
