import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

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

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    const { error } = await supabase.from("comments").insert([
      {
        post_id: postId,
        user_id: user.id,
        comment_text: commentText,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      setCommentText("");
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
        <button type="submit" style={styles.btn}>
          Send
        </button>
      </form>

      <div>
        {comments.length === 0 ? (
          <p style={{ color: "gray" }}>No comments yet...</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} style={styles.comment}>
              <b>@{c.profiles?.username}</b>: {c.comment_text}
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
    padding: "10px",
    background: "#fff",
    borderRadius: "8px",
  },
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid gray",
  },
  btn: {
    padding: "10px 15px",
    background: "green",
    border: "none",
    color: "white",
    cursor: "pointer",
    borderRadius: "6px",
  },
  comment: {
    padding: "6px",
    borderBottom: "1px solid #ddd",
    fontSize: "14px",
  },
};

export default CommentSection;