import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // allow only images
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed!");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadPostImage = async () => {
    if (!imageFile) return "";

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${user.id}.${fileExt}`;

    const { error } = await supabase.storage
      .from("media")
      .upload(`posts/${fileName}`, imageFile, {
        upsert: false,
      });

    if (error) {
      alert("Image upload failed: " + error.message);
      return "";
    }

    const { data } = supabase.storage
      .from("media")
      .getPublicUrl(`posts/${fileName}`);

    return data.publicUrl;
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("Post content cannot be empty!");
      return;
    }

    setLoading(true);

    // Upload image if selected
    const uploadedImageUrl = await uploadPostImage();

    const { error } = await supabase.from("posts").insert([
      {
        user_id: user.id,
        content: content,
        media_url: uploadedImageUrl,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Error creating post: " + error.message);
    } else {
      alert("Post created successfully!");
      navigate("/");
    }
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>Create a Post</h1>

        <form onSubmit={handleCreatePost}>
          <textarea
            rows="6"
            placeholder="Write your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              marginBottom: "15px",
            }}
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginBottom: "15px" }}
          />

          {preview && (
            <div style={{ marginBottom: "15px" }}>
              <p>Image Preview:</p>
              <img
                src={preview}
                alt="preview"
                style={{
                  width: "250px",
                  borderRadius: "10px",
                  border: "2px solid #ddd",
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
              background: "green",
              color: "white",
              border: "none",
              borderRadius: "6px",
            }}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreatePost;