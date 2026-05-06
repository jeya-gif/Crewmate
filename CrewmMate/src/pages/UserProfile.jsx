import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/posts/PostCard";
import { useNavigate } from "react-router-dom";


const UserProfile = () => {
  const { id } = useParams(); // other user id
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) setProfile(data);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles(username, full_name),
        likes(count),
        comments(count)
      `)
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    if (!error) setPosts(data);
  };

  const navigate = useNavigate();
  const handleMessage = async () => {
  // Ensure smaller id stored in user1_id always (avoid duplicates)
  const user1 = user.id < id ? user.id : id;
  const user2 = user.id < id ? id : user.id;

  // check existing conversation
  const { data: existingConv, error: fetchError } = await supabase
    .from("conversations")
    .select("*")
    .eq("user1_id", user1)
    .eq("user2_id", user2)
    .single();

  if (existingConv) {
    navigate(`/chat/${existingConv.id}`);
    return;
  }

  // create new conversation
  const { data, error } = await supabase
    .from("conversations")
    .insert([{ user1_id: user1, user2_id: user2 }])
    .select()
    .single();

  if (error) {
    alert(error.message);
  } else {
    navigate(`/chat/${data.id}`);
  }
};

  const checkFollowing = async () => {
    const { data } = await supabase
      .from("followers")
      .select("*")
      .eq("follower_id", user.id)
      .eq("following_id", id)
      .single();

    if (data) setIsFollowing(true);
    else setIsFollowing(false);
  };

    const handleFollow = async () => {
        if (!isFollowing) {
            const { error } = await supabase.from("followers").insert([
                {
                    follower_id: user.id,
                    following_id: id,
                },
            ]);
            if (error) {
                alert(error.message);
            } else {
                setIsFollowing(true);
                if (user.id !== id) {
                    await supabase.from("notifications").insert([
                        {
                            user_id: id,
                            sender_id: user.id,
                            type: "follow",
                            message: "started following you",
                        },
                    ]);
                } 
            }
        } else {
            const { error } = await supabase
            .from("followers")
            .delete()
            .eq("follower_id", user.id)
            .eq("following_id", id);
            if (error) alert(error.message);
            else setIsFollowing(false);
        }
    };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPosts();
      checkFollowing();
    }
  }, [user]);

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        {profile ? (
          <div style={styles.profileBox}>
            <img
              src={profile.profile_pic || "https://via.placeholder.com/120"}
              alt="profile"
              style={styles.img}
            />

            <div>
              <h2>{profile.full_name || "No Name"}</h2>
              <p>@{profile.username}</p>
              <p style={{ marginTop: "10px" }}>
                {profile.bio || "No bio available"}
              </p>

              <button
                onClick={handleFollow}
                style={{
                  ...styles.followBtn,
                  background: isFollowing ? "crimson" : "green",
                }}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
              <button onClick={handleMessage} style={styles.msgBtn}>
                 Message
              </button>
            </div>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}

        <h2 style={{ marginTop: "40px" }}>Posts</h2>

        {posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} refreshPosts={fetchPosts} />
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
  img: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  followBtn: {
    marginTop: "15px",
    padding: "10px 15px",
    border: "none",
    cursor: "pointer",
    borderRadius: "6px",
    color: "white",
  },
  msgBtn: {
  marginTop: "10px",
  padding: "10px 15px",
  border: "none",
  cursor: "pointer",
  borderRadius: "6px",
  background: "#2563eb",
  color: "white",
  fontWeight: "bold",
},
};

export default UserProfile;