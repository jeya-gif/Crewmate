import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
  });

  const [currentPic, setCurrentPic] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error) {
      setFormData({
        full_name: data.full_name || "",
        username: data.username || "",
        bio: data.bio || "",
      });

      setCurrentPic(data.profile_pic || "");
    }
  };

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed!");
      return;
    }

    setProfilePic(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadProfilePic = async () => {
    if (!profilePic) return null;

    const fileExt = profilePic.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;

    const { error } = await supabase.storage
      .from("media")
      .upload(`profiles/${fileName}`, profilePic, {
        upsert: true,
      });

    if (error) {
      alert("Upload error: " + error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("media")
      .getPublicUrl(`profiles/${fileName}`);

    return data.publicUrl;
  };

  const handleRemovePhoto = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ profile_pic: "" })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Profile photo removed!");
      setCurrentPic("");
      setPreview(null);
      setProfilePic(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const profilePicUrl = await uploadProfilePic();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        profile_pic: profilePicUrl ? profilePicUrl : currentPic,
      })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      alert("Update error: " + error.message);
    } else {
      alert("Profile updated successfully!");
      navigate("/profile");
    }
  };

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Edit Profile</h1>

          <div style={styles.profilePicBox}>
            <img
              src={
                preview ||
                currentPic ||
                "https://www.w3schools.com/howto/img_avatar.png"
              }
              alt="profile"
              style={styles.profileImg}
            />

            <div>
              <input type="file" accept="image/*" onChange={handleImageChange} />

              {currentPic && (
                <button
                  onClick={handleRemovePhoto}
                  disabled={loading}
                  style={styles.removeBtn}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleUpdate} style={styles.form}>
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <textarea
              rows="4"
              name="bio"
              placeholder="Bio"
              value={formData.bio}
              onChange={handleChange}
              style={styles.textarea}
            />

            <button type="submit" disabled={loading} style={styles.updateBtn}>
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
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
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
},

card: {
  width: "600px",
  maxWidth: "100%",
  background: "var(--card)",
  borderRadius: "14px",
  padding: "25px",
  border: "1px solid var(--border)",
  color: "var(--text)",
},
  title: {
    textAlign: "center",
    marginBottom: "25px",
  },
  profilePicBox: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  profileImg: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #ddd",
  },
  removeBtn: {
    marginTop: "10px",
    padding: "8px 12px",
    border: "none",
    background: "crimson",
    color: "white",
    cursor: "pointer",
    borderRadius: "6px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  textarea: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  updateBtn: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    background: "green",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default EditProfile;