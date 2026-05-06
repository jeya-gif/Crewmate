import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { supabase } from "../services/supabaseClient";
import PostCard from "../components/posts/PostCard";

const Home = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles(username, full_name),
      likes(count),
      comments(count)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    alert("Error fetching posts: " + error.message);
  } else {
    setPosts(data);
  }
};

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <>
      <Navbar />

      <div style={{padding: "30px", color: "var(--text)"}}>
        <h1>Home Feed</h1>

        {posts.length === 0 ? (
          <p>No posts yet...</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} refreshPosts={fetchPosts} />
          ))
        )}
      </div>
    </>
  );
};

export default Home;