import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import NotificationButton from "../components/NotificationButton";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/posts/PostCard";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error) {
      setProfile(data);
    }

    setLoadingProfile(false);
  };

  const fetchMyPosts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        profiles(username, full_name),
        likes(count),
        comments(count)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setPosts(data);
    }

    setLoadingPosts(false);
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchMyPosts();
    }
  }, [user]);

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        {/* PROFILE CARD */}
        <div style={styles.card}>
          <div style={styles.topRow}>
            <div style={styles.profileInfo}>
              <img
                src={
                  profile?.profile_pic ||
                  "https://www.w3schools.com/howto/img_avatar.png"
                }
                alt="profile"
                style={styles.profileImg}
              />

              <div>
                <h1 style={styles.name}>{profile?.full_name || "Your Name"}</h1>
                <p style={styles.username}>@{profile?.username || "username"}</p>
                <p style={styles.bio}>{profile?.bio || "No bio added yet."}</p>
              </div>
            </div>

            <div style={styles.actionRow}>
              <button
                onClick={() => navigate("/edit-profile")}
                style={styles.editBtn}
              >
                Edit Profile
              </button>
              <NotificationButton />
            </div>
          </div>

          {loadingProfile && <p style={styles.loading}>Loading profile...</p>}
        </div>

        {/* POSTS SECTION */}
        <div style={styles.postsSection}>
          <h2 style={styles.postsTitle}>My Posts</h2>

          {loadingPosts ? (
            <p style={styles.loading}>Loading posts...</p>
          ) : posts.length === 0 ? (
            <p style={styles.loading}>No posts yet...</p>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} refreshPosts={fetchMyPosts} />
            ))
          )}
        </div>
      </div>
    </>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    background: "var(--bg)",
    color: "var(--text)",
  },
  card: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "28px",
    borderRadius: "18px",
    background: "var(--card)",
    border: "1px solid var(--border)",
    color: "var(--text)",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  profileInfo: {
    display: "flex",
    gap: "18px",
    alignItems: "flex-start",
    flex: 1,
    minWidth: 0,
  },
  profileImg: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid var(--border)",
  },
  name: {
    margin: 0,
    fontSize: "28px",
  },
  username: {
    margin: "6px 0 0",
    color: "var(--muted)",
  },
  bio: {
    marginTop: "14px",
    maxWidth: "720px",
    lineHeight: 1.6,
    color: "var(--text)",
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  editBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--text)",
    cursor: "pointer",
    fontWeight: 600,
  },
  loading: {
    marginTop: "18px",
    color: "var(--muted)",
  },

  postsSection: {
    maxWidth: "900px",
    margin: "40px auto 0",
  },

  postsTitle: {
    marginBottom: "20px",
    fontSize: "22px",
  },
};

export default Profile;