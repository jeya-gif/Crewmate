import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function NotificationButton() {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const { data } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    setEnabled(!!data);
  };

  const enableNotifications = async () => {
    try {
      setLoading(true);

      if (!("serviceWorker" in navigator)) {
        alert("Service worker not supported");
        return;
      }

      if (Notification.permission === "denied") {
        alert("Notifications blocked. Enable it in browser settings.");
        return;
      }

      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          alert("Permission not granted");
          return;
        }
      }

      const sw =
        (await navigator.serviceWorker.getRegistration()) ||
        (await navigator.serviceWorker.register("/sw.js"));

      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      
      // ✅ Fix: check existing subscription first
      let subscription = await sw.pushManager.getSubscription();

      if (!subscription) {
        subscription = await sw.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      const json = subscription.toJSON();

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        alert("Login required");
        return;
      }

      const { error } = await supabase
        .from("user_subscriptions")
        .upsert(
          {
            user_id: user.id,
            endpoint: json.endpoint,
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
          },
          { onConflict: ["user_id"] }
        );

      if (error) {
        console.log(error);
        alert("Failed to enable notifications");
        return;
      }

      setEnabled(true);
    } catch (err) {
      console.log(err);
      alert("Enable failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const disableNotifications = async () => {
    try {
      setLoading(true);

      const registration = await navigator.serviceWorker.getRegistration();

      if (registration) {
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (user) {
        await supabase
          .from("user_subscriptions")
          .delete()
          .eq("user_id", user.id);
      }

      setEnabled(false);
    } catch (err) {
      console.log(err);
      alert("Disable failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={enabled ? disableNotifications : enableNotifications}
      disabled={loading}
      style={{
        marginTop: "12px",
        padding: "8px 14px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "600",
        border: "1px solid var(--border)",
        background: enabled ? "crimson" : "var(--card)",
        color: enabled ? "white" : "var(--text)",
        cursor: "pointer",
        transition: "0.2s ease",
        display: "inline-block",
      }}
    >
      {loading
        ? "Please wait..."
        : enabled
        ? "🔕 Disable Notifications"
        : "🔔 Enable Notifications"}
    </button>
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}