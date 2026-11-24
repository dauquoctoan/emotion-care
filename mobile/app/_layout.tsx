import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
import { ActivityIndicator, Appearance, View } from "react-native";
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";

// Lock app runtime and native bridge to Dark Mode
Appearance.setColorScheme('dark');

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
          backgroundColor: "#08090C",
        }}
      >
        <ActivityIndicator color="#C084FC" size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <NotificationProvider>
          <ThemeProvider value={DarkTheme}>
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
            <StatusBar style="light" />
          </ThemeProvider>
        </NotificationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
