import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signupError) throw signupError;

      const user = data.user;

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          full_name: formData.full_name,
          username: formData.username,
          bio: "",
          profile_pic: "",
        },
      ]);

      if (profileError) throw profileError;

      alert("Signup successful! Now login.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account 🚀</h1>
        <p style={styles.subtitle}>
          Join <b>CrewMate</b> and start sharing your thoughts
        </p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="full_name"
              placeholder="Enter your name"
              value={formData.full_name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.signupBtn}>
            {loading ? "Creating Account..." : "Signup"}
          </button>
        </form>

        <p style={styles.bottomText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
    padding: "20px",
  },
  card: {
    width: "450px",
    maxWidth: "100%",
    background: "white",
    borderRadius: "14px",
    padding: "35px",
    boxShadow: "0px 8px 25px rgba(0,0,0,0.25)",
  },
  title: {
    margin: "0px",
    fontSize: "28px",
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "gray",
    marginTop: "8px",
    marginBottom: "25px",
    fontSize: "15px",
  },
  error: {
    background: "#ffe6e6",
    color: "red",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "15px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "12px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
  },
  signupBtn: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    background: "#0f2027",
    color: "white",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
  },
  bottomText: {
    textAlign: "center",
    marginTop: "18px",
    fontSize: "14px",
    color: "#444",
  },
  link: {
    color: "#0f2027",
    fontWeight: "bold",
    textDecoration: "none",
  },
};

export default Signup;