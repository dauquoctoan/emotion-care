import { useContext } from "react";

import { NotificationContext } from "@/providers/NotificationProvider";

export function useNotification() {
  return useContext(NotificationContext);
}
