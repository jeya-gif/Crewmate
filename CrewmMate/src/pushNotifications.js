import { supabase } from "./supabaseClient";

// convert VAPID public key string into Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function enableNotifications(userId) {
  if (!("serviceWorker" in navigator)) {
    alert("Service Worker not supported in this browser");
    return;
  }
   const reg = await navigator.serviceWorker.register("/sw.js");
  console.log("SW Registered:", reg);

  // ✅ Instagram style permission check
  if (Notification.permission === "denied") {
    alert("You blocked notifications. Enable it in browser settings.");
    return;
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Notification permission denied");
      return;
    }
  }

  // ✅ Get existing SW registration or register new one
  const registration =
    (await navigator.serviceWorker.getRegistration()) ||
    (await navigator.serviceWorker.register("/sw.js"));

  

  if (!vapidPublicKey) {
    alert("VAPID public key missing in .env");
    return;
  }

  // ✅ Fix: Check if already subscribed
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  const subData = subscription.toJSON();

  // ✅ Fix: upsert so it won't fail if already exists
 const { error } = await supabase
  .from("user_subscriptions")
  .upsert(
    {
      user_id: user.id,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    { onConflict: "user_id" }
  );
  if (error) {
    console.error(error);
    alert("Failed to save subscription");
  } else {
    alert("Notifications enabled successfully!");
  }
}