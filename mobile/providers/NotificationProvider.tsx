import { createContext, useEffect, useState } from "react";

import * as Notifications from "expo-notifications";

import {
  getExpoPushToken,
  requestPermission,
  setupAndroidChannel,
} from "@/services/notification.service";

type NotificationContextType = {
  expoPushToken: string | null;
  permissionGranted: boolean;
};

export const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: null,
  permissionGranted: false,
});

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    let notificationListener: Notifications.EventSubscription | undefined;

    let responseListener: Notifications.EventSubscription | undefined;

    const init = async () => {
      await setupAndroidChannel();

      const granted = await requestPermission();

      setPermissionGranted(granted);

      if (granted) {
        const token = await getExpoPushToken();

        setExpoPushToken(token);
      }

      notificationListener = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log("received", notification);
        },
      );

      responseListener = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          console.log("clicked", response);
        },
      );
    };

    init();

    return () => {
      notificationListener?.remove();
      responseListener?.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        permissionGranted,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
