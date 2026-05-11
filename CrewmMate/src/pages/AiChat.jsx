import { useEffect, useState, useRef } from "react";
import Navbar from "../components/common/Navbar";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

const AiChat = () => {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchAiMessages = async () => {
    const { data, error } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.log("Fetch AI messages error:", error.message);
    } else {
      setMessages(data);
    }
  };

  useEffect(() => {
    if (user) fetchAiMessages();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() || loading) return;

    const userText = text;
    setText("");

    // ✅ Add user message instantly into UI
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        message: userText,
      },
    ]);

    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(
        "https://atikjtjekyilfasassbv.supabase.co/functions/v1/ai-chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: userText }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "AI server error");
      }

      // ✅ Add AI reply instantly into UI
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          message: data.reply,
        },
      ]);
    } catch (err) {
      alert("AI Error: " + err.message);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          message: "⚠️ Sorry, AI is not responding right now.",
        },
      ]);
    }

    setLoading(false);

    // optional refresh to sync DB messages
    fetchAiMessages();
  };

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.chatBox}>
          <h2 style={{ marginTop: 0 }}>🤖 CrewMate AI</h2>

          <div style={styles.messages}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.message,
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  background:
                    msg.role === "user" ? "#2563eb" : "var(--card)",
                  color: msg.role === "user" ? "white" : "var(--text)",
                }}
              >
                <p style={{ margin: 0 }}>{msg.message}</p>
              </div>
            ))}

            {loading && (
              <p style={{ color: "var(--muted)", margin: 0 }}>
                AI is typing...
              </p>
            )}

            <div ref={bottomRef}></div>
          </div>

          <form onSubmit={sendMessage} style={styles.form}>
            <input
              type="text"
              placeholder="Ask CrewMate AI..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={styles.input}
              disabled={loading}
            />

            <button style={styles.btn} disabled={loading}>
              {loading ? "..." : "Send"}
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
    width: "900px",
    maxWidth: "100%",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    color: "var(--text)",
  },
  messages: {
    height: "450px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid var(--border)",
    background: "var(--bg)",
  },
  message: {
    padding: "12px 14px",
    borderRadius: "12px",
    maxWidth: "75%",
    fontSize: "15px",
    lineHeight: "1.4",
    wordBreak: "break-word",
  },
  form: {
    display: "flex",
    gap: "10px",
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

export default AiChat;