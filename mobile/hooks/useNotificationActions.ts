import {
    cancelAllNotifications,
    cancelNotification,
    requestPermission,
    scheduleNotification,
} from "@/services/notification.service";

export function useNotificationActions() {
  return {
    requestPermission,

    scheduleNotification,

    cancelNotification,

    cancelAllNotifications,
  };
}
