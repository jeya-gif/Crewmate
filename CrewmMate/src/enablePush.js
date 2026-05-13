import { supabase } from "./services/supabaseClient";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function enablePushNotifications() {
  if (!("serviceWorker" in navigator)) {
    alert("Service worker not supported");
    return;
  }

  // Ask only once (Instagram style)
  if (Notification.permission === "denied") {
    alert("You blocked notifications. Enable it in browser settings.");
    return;
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Permission not granted");
      return;
    }
  }

  const registration = await navigator.serviceWorker.register("/sw.js");

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  console.log("VAPID:", vapidKey);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });

  const user = (await supabase.auth.getUser()).data.user;

  if (!user) {
    alert("Login required");
    return;
  }

  const json = subscription.toJSON();

  await supabase.from("user_subscriptions").upsert({
    user_id: user.id,
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  });

  alert("Notifications enabled!");
}