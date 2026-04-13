import { useState, useEffect } from "react";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!supported) return "denied";

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  return { permission, supported, requestPermission };
}