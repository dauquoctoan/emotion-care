import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function requestPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();

    finalStatus = status;
  }

  return finalStatus === "granted";
}

export async function setupAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
  });
}

export async function getExpoPushToken() {
  const token = await Notifications.getExpoPushTokenAsync();

  return token.data;
}

export async function scheduleNotification(
  title: string,
  body: string,
  seconds?: number,
) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger:
      typeof seconds === "number"
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
          }
        : null,
  });
}

export async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
