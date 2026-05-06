import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import CommentSection from "./CommentSection";

const PostCard = ({ post, refreshPosts }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // check if current user already liked this post
  const checkLikeStatus = async () => {
    const { data, error } = await supabase
      .from("likes")
      .select("*")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .single();

    if (data) setLiked(true);
    else setLiked(false);
  };

  useEffect(() => {
    if (user) checkLikeStatus();
  }, []);

  // Like / Unlike
  const handleLike = async () => {
  setLoading(true);

    if (!liked) {
    // LIKE
     const { error } = await supabase.from("likes").insert([
      {
        post_id: post.id,
        user_id: user.id,
      },
     ]);

    if (error) {
      alert(error.message);
      } else {
      setLiked(true);

      // Notification (only if liking someone else's post)
      if (post.user_id !== user.id) {
        await supabase.from("notifications").insert([
          {
            user_id: post.user_id, // receiver (post owner)
            sender_id: user.id, // sender (logged in user)
            type: "like",
            message: "liked your post",
          },
        ]);
      }
    }
  } else {
    // UNLIKE
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", post.id)
      .eq("user_id", user.id);

    if (error) {
      alert(error.message);
    } else {
      setLiked(false);
    }
  }

  setLoading(false);
  refreshPosts();
  };

  const handleDelete = async () => {
    setLoading(true);

    const { error } = await supabase.from("posts").delete().eq("id", post.id);

    setLoading(false);

    if (error) {
      alert("Error deleting post: " + error.message);
    } else {
      refreshPosts();
    }
  };

  return (
    <div style={styles.card}>
      <h4 style={{ marginBottom: "5px" }}>
        @{post.profiles?.username || "unknown"}
      </h4>

      <p style={styles.content}>{post.content}</p>

      {post.media_url && (
        <img
          src={post.media_url}
          alt="media"
          style={{ width: "100%", borderRadius: "8px", marginTop: "10px" }}
        />
      )}

      <p style={styles.date}>
        {new Date(post.created_at).toLocaleString()}
      </p>

      <div style={styles.actions}>
        <button
          style={{
            ...styles.likeBtn,
            background: liked ? "crimson" : "#333",
          }}
          onClick={handleLike}
          disabled={loading}
        >
          {liked ? "❤️ Liked" : "🤍 Like"} ({post.likes?.[0]?.count || 0})
        </button>


        <button
        style={styles.commentBtn}
        onClick={() => setShowComments(!showComments)}>
            💬 Comments ({post.comments?.[0]?.count || 0})
        </button>
      </div>

      {user?.id === post.user_id && (
        <button style={styles.deleteBtn} onClick={handleDelete} disabled={loading}>
          Delete
        </button>

      )}
      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
};

const styles = {
  card: {
    background: "var(--card)",
    color: "var(--text)",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid var(--border)",
  },

  content: {
    fontSize: "18px",
    marginBottom: "10px",
    color: "var(--text)", // ✅ Important
  },

  date: {
    fontSize: "13px",
    color: "var(--muted)", // ✅ muted color
    marginTop: "10px",
  },
  actions: {
    display: "flex",
    gap: "15px",
    marginTop: "15px",
  },
  likeBtn: {
    padding: "8px 14px",
    border: "none",
    color: "white",
    cursor: "pointer",
    borderRadius: "6px",
  },
  commentBtn: {
    padding: "8px 14px",
    border: "none",
    background: "#555",
    color: "white",
    cursor: "pointer",
    borderRadius: "6px",
  },
  deleteBtn: {
    marginTop: "15px",
    padding: "8px 12px",
    border: "none",
    background: "black",
    color: "white",
    cursor: "pointer",
    borderRadius: "6px",
  },
};

export default PostCard;