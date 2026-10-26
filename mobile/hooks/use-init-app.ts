import { deviceInfo } from "@/services/api-service.ts";
import { initDevice } from "@/services/device-id.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export function useInitApp() {
  const [isReady, setIsReady] = useState(false);

  const init = async () => {
    try {
      await initDevice();
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
