import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import CommentSection from "./CommentSection";
import { Link } from "react-router-dom";

const PostCard = ({ post, refreshPosts }) => {
  const { user } = useAuth();

  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Check if already liked
  const checkLikeStatus = async () => {
    const { data } = await supabase
      .from("likes")
      .select("*")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .single();

    if (data) {
      setLiked(true);
    } else {
      setLiked(false);
    }
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

        // Notification
        if (post.user_id !== user.id) {
          await supabase.from("notifications").insert([
            {
              user_id: post.user_id,
              sender_id: user.id,
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

  // Delete Post
  const handleDelete = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id);

    setLoading(false);

    if (error) {
      alert("Error deleting post: " + error.message);
    } else {
      refreshPosts();
    }
  };

  return (
    <div style={styles.card}>

      {/* CLICKABLE USERNAME */}
      <Link
        to={`/user/${post.user_id}`}
        style={styles.username}
      >
        @{post.profiles?.username || "unknown"}
      </Link>

      {/* POST CONTENT */}
      <p style={styles.content}>{post.content}</p>

      {/* MEDIA */}
      {post.media_url && (
        <img
          src={post.media_url}
          alt="media"
          style={styles.media}
        />
      )}

      {/* DATE */}
      <p style={styles.date}>
        {new Date(post.created_at).toLocaleString()}
      </p>

      {/* ACTIONS */}
      <div style={styles.actions}>
        <button
          style={{
            ...styles.likeBtn,
            background: liked ? "crimson" : "#333",
          }}
          onClick={handleLike}
          disabled={loading}
        >
          {liked ? "❤️ Liked" : "🤍 Like"} (
          {post.likes?.[0]?.count || 0})
        </button>

        <button
          style={styles.commentBtn}
          onClick={() => setShowComments(!showComments)}
        >
          💬 Comments (
          {post.comments?.[0]?.count || 0})
        </button>
      </div>

      {/* DELETE BUTTON */}
      {user?.id === post.user_id && (
        <button
          style={styles.deleteBtn}
          onClick={handleDelete}
          disabled={loading}
        >
          Delete
        </button>
      )}

      {/* COMMENTS */}
      {showComments && (
        <CommentSection postId={post.id} />
      )}
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

  username: {
    display: "inline-block",
    textDecoration: "none",
    color: "var(--text)",
    fontWeight: "700",
    fontSize: "17px",
    marginBottom: "12px",
    transition: "0.3s",
    cursor: "pointer",
  },

  content: {
    fontSize: "18px",
    marginBottom: "10px",
    color: "var(--text)",
  },

  media: {
    width: "100%",
    borderRadius: "8px",
    marginTop: "10px",
  },

  date: {
    fontSize: "13px",
    color: "var(--muted)",
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