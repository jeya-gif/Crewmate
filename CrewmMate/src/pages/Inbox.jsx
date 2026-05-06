import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Inbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        user1:profiles!conversations_user1_id_fkey(id, username, full_name, profile_pic),
        user2:profiles!conversations_user2_id_fkey(id, username, full_name, profile_pic)
      `
      )
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Inbox fetch error:", error.message);
    } else {
      setConversations(data);
    }
  };

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px", color: "var(--text)" }}>
        <h1>Inbox</h1>

        {conversations.length === 0 ? (
          <p className="muted">No conversations yet...</p>
        ) : (
          conversations.map((conv) => {
            const otherUser =
              conv.user1_id === user.id ? conv.user2 : conv.user1;

            return (
              <div
                key={conv.id}
                style={styles.card}
                onClick={() => navigate(`/chat/${conv.id}`)}
              >
                <img
                  src={
                    otherUser?.profile_pic ||
                    "https://www.w3schools.com/howto/img_avatar.png"
                  }
                  alt="profile"
                  style={styles.img}
                />

                <div>
                  <h3 style={{ margin: 0 }}>
                    {otherUser?.full_name || "No Name"}
                  </h3>
                  <p style={{ margin: 0, color: "var(--muted)" }}>
                    @{otherUser?.username}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

const styles = {
  card: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    padding: "15px",
    borderRadius: "12px",
    display: "flex",
    gap: "15px",
    alignItems: "center",
    cursor: "pointer",
    marginBottom: "15px",
    transition: "0.2s",
  },
  img: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
  },
};

export default Inbox;