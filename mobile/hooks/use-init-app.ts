import { registerPushToken } from "@/services/api";
import { initDevice } from "@/services/device-id.service";
import { getExpoPushToken, requestPermission } from "@/services/notification.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export function useInitApp() {
  const [isReady, setIsReady] = useState(false);

  const init = async () => {
    try {
      await initDevice();

      // Register push token if permitted
      try {
        const hasPermission = await requestPermission();
        if (hasPermission) {
          const pushToken = await getExpoPushToken();
          if (pushToken) {
            await registerPushToken(pushToken);
          }
        }
      } catch (err) {
        console.log("Push token registration skipped or failed:", err);
      }

      const hasLaunched = await AsyncStorage.getItem("has_launched");

      if (!hasLaunched) {
        await AsyncStorage.setItem("has_launched", "true");
        requestAnimationFrame(() => {
          router.replace("/welcome-screen");
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return { isReady };
}
