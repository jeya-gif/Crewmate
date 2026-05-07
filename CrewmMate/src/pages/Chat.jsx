import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chatUser, setChatUser] = useState(null);

  // FETCH MESSAGES
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(
          username,
          full_name
        )
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.log("Message fetch error:", error.message);
    } else {
      setMessages(data);
    }
  };

  // FETCH CHAT USER
  const fetchChatUser = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        *,
        user1:profiles!conversations_user1_id_fkey(
          id,
          username
        ),
        user2:profiles!conversations_user2_id_fkey(
          id,
          username
        )
      `)
      .eq("id", conversationId)
      .single();

    if (!error && data) {
      const otherUser =
        data.user1.id === user.id
          ? data.user2
          : data.user1;

      setChatUser(otherUser);
    }
  };

  useEffect(() => {
    if (conversationId && user) {
      fetchMessages();
      fetchChatUser();
    }
  }, [conversationId, user]);

  // SEND MESSAGE
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    const { error } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          sender_id: user.id,
          message: text,
        },
      ]);

    if (error) {
      alert(error.message);
    } else {
      setText("");
      fetchMessages();
    }
  };

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.chatBox}>

          {/* CHAT HEADER */}
          <div style={styles.header}>

            {/* BACK BUTTON */}
            <button
              style={styles.backBtn}
              onClick={() => navigate("/inbox")}
            >
              ←
            </button>

            {/* CHAT USERNAME */}
            <h3 style={styles.username}>
              {chatUser?.username || "Chat"}
            </h3>
          </div>

          {/* MESSAGES */}
          <div style={styles.messages}>
            {messages.length === 0 ? (
              <p className="muted">No messages yet...</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.message,
                    alignSelf:
                      msg.sender_id === user.id
                        ? "flex-end"
                        : "flex-start",

                    background:
                      msg.sender_id === user.id
                        ? "#2563eb"
                        : "var(--card)",

                    color:
                      msg.sender_id === user.id
                        ? "white"
                        : "var(--text)",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    {msg.message}
                  </p>

                  <small
                    style={{
                      fontSize: "11px",
                      opacity: 0.7,
                    }}
                  >
                    {new Date(
                      msg.created_at
                    ).toLocaleTimeString()}
                  </small>
                </div>
              ))
            )}
          </div>

          {/* MESSAGE INPUT */}
          <form
            onSubmit={sendMessage}
            style={styles.form}
          >
            <input
              type="text"
              placeholder="Type message..."
              value={text}
              onChange={(e) =>
                setText(e.target.value)
              }
              style={styles.input}
            />

            <button style={styles.btn}>
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

const styles = {
  page: {
    padding: "30px",
    display: "flex",
    justifyContent: "center",
    background: "var(--bg)",
    minHeight: "100vh",
  },

  chatBox: {
    width: "800px",
    maxWidth: "100%",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    color: "var(--text)",
    overflow: "hidden",
  },

  // HEADER
  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "16px 20px",
    borderBottom: "1px solid var(--border)",
    background: "var(--card)",
  },

  backBtn: {
    border: "none",
    background: "transparent",
    color: "var(--text)",
    fontSize: "24px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  username: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
  },

  // MESSAGES
  messages: {
    height: "500px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "20px",
    background: "var(--bg)",
  },

  message: {
    padding: "10px 14px",
    borderRadius: "14px",
    maxWidth: "70%",
    wordBreak: "break-word",
  },

  // INPUT
  form: {
    display: "flex",
    gap: "10px",
    padding: "15px",
    borderTop: "1px solid var(--border)",
    background: "var(--card)",
  },

  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    outline: "none",
  },

  btn: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Chat;