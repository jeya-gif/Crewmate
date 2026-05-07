import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(username)")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (!error) setComments(data);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // ADD COMMENT
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    setLoading(true);

    const { error } = await supabase.from("comments").insert([
      {
        post_id: postId,
        user_id: user.id,
        comment_text: commentText,
      },
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setCommentText("");
      fetchComments();
    }
  };

  // DELETE COMMENT
  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm("Delete this comment?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      alert("Error deleting comment: " + error.message);
    } else {
      fetchComments();
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleAddComment} style={styles.form}>
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </form>

      <div style={styles.commentsBox}>
        {comments.length === 0 ? (
          <p style={styles.noComments}>No comments yet...</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} style={styles.comment}>
              <div style={styles.commentText}>
                <span style={styles.username}>
                  @{c.profiles?.username || "unknown"}
                </span>
                <span style={styles.text}> {c.comment_text}</span>
              </div>

              {/* DELETE BUTTON ONLY FOR OWNER */}
              {c.user_id === user.id && (
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDeleteComment(c.id)}
                >
                  ✖
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    marginTop: "15px",
    padding: "12px",
    background: "var(--bg)",
    borderRadius: "10px",
    border: "1px solid var(--border)",
  },

  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--text)",
    outline: "none",
  },

  btn: {
    padding: "10px 15px",
    background: "#16a34a",
    border: "none",
    color: "white",
    cursor: "pointer",
    borderRadius: "8px",
    fontWeight: "600",
  },

  commentsBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  noComments: {
    color: "var(--muted)",
    margin: 0,
  },

  comment: {
    padding: "10px 12px",
    borderRadius: "8px",
    background: "var(--card)",
    border: "1px solid var(--border)",
    fontSize: "14px",
    color: "var(--text)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  commentText: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    flex: 1,
  },

  username: {
    fontWeight: "700",
    color: "var(--text)",
  },

  text: {
    color: "var(--text)",
  },

  deleteBtn: {
    border: "none",
    background: "transparent",
    color: "crimson",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default CommentSection;