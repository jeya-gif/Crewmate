import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

const fetchNotifications = async () => {
  const { data, error } = await supabase
    .from("notifications")
    .select(`
      *,
      sender:profiles!notifications_sender_id_fkey(username, full_name, profile_pic)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Notification fetch error:", error.message);
  } else {
    setNotifications(data);
  }
  };
  const markAsRead = async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    fetchNotifications();
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>Notifications</h1>

        {notifications.length === 0 ? (
          <p>No notifications yet...</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: "15px",
                marginBottom: "12px",
                borderRadius: "10px",
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                opacity: n.is_read ? 0.6 : 1,
              }}
            >
              <p style={{ margin: 0 }}>
                <b>@{n.sender?.username}</b> {n.message}
              </p>

              <small style={{ color: "var(--muted)" }}>
                {new Date(n.created_at).toLocaleString()}
                </small>

              {!n.is_read && (
                <button
                  style={{
                    marginTop: "10px",
                    padding: "7px 12px",
                    border: "none",
                    background: "black",
                    color: "white",
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}
                  onClick={() => markAsRead(n.id)}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </>
);
};

export default Notifications;