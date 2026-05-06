import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/posts/PostCard";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error) setProfile(data);
  };

  const fetchMyPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles(username, full_name),
        likes(count),
        comments(count)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setPosts(data);
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

      <div style={{ padding: "30px", color: "var(--text)" }}>
        <h1>My Profile</h1>

        {profile ? (
          <div style={styles.profileBox}>
            <img
              src={
                profile.profile_pic
                  ? profile.profile_pic
                  : "https://via.placeholder.com/120"
              }
              alt="profile"
              style={styles.profileImg}
            />

            <div>
              <h2>{profile.full_name || "No Name"}</h2>
              <p>@{profile.username}</p>
              <p style={{ marginTop: "10px" }}>
                {profile.bio || "No bio added yet."}
              </p>

              <Link to="/edit-profile">
                <button style={styles.editBtn}>Edit Profile</button>
              </Link>
            </div>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}

        <h2 style={{ marginTop: "40px" }}>My Posts</h2>

        {posts.length === 0 ? (
          <p>No posts yet...</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} refreshPosts={fetchMyPosts} />
          ))
        )}
      </div>
    </>
  );
};

const styles = {
  profileBox: {
  display: "flex",
  gap: "20px",
  background: "var(--card)",
  padding: "20px",
  borderRadius: "12px",
  alignItems: "center",
  border: "1px solid var(--border)",
  color: "var(--text)",
  flexWrap: "wrap",
},
  profileImg: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  editBtn: {
    marginTop: "15px",
    padding: "10px 15px",
    background: "black",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "6px",
  },
};

export default Profile;