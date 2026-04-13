import { apiFetch } from "./api";

const BASE_URL = "https://ecoponto-api-08ow.onrender.com";

export async function getVapidPublicKey(): Promise<string> {
  const res = await fetch(`${BASE_URL}/push/public-key`);
  if (!res.ok) throw new Error("Failed to get VAPID key");
  const data = await res.json();
  return data.publicKey;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    return reg;
  } catch (err) {
    console.error("SW registration failed:", err);
    return null;
  }
}

export async function subscribeToPush(cidade: string): Promise<boolean> {
  try {
    const reg = await registerServiceWorker();
    if (!reg) return false;

    const publicKey = await getVapidPublicKey();
    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource,
    });

    const sub = subscription.toJSON() as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    await apiFetch("/push/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        endpoint: sub.endpoint,
        keys: sub.keys,
        cidade,
        userAgent: navigator.userAgent,
        platform: navigator.platform || "web",
      }),
    });

    return true;
  } catch (err) {
    console.error("Push subscription failed:", err);
    return false;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    if (!("serviceWorker" in navigator)) return false;
    const reg = await navigator.serviceWorker.getRegistration("/sw.js");
    if (!reg) return false;

    const subscription = await reg.pushManager.getSubscription();
    if (!subscription) return false;

    await apiFetch("/push/subscriptions", {
      method: "DELETE",
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    await subscription.unsubscribe();
    return true;
  } catch (err) {
    console.error("Push unsubscribe failed:", err);
    return false;
  }
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  try {
    if (!("serviceWorker" in navigator)) return null;
    const reg = await navigator.serviceWorker.getRegistration("/sw.js");
    if (!reg) return null;
    return reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}
