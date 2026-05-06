import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      console.log("Login success:", data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back 👋</h1>
        <p style={styles.subtitle}>
          Login to continue using <b>CrewMate</b>
        </p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleLogin} style={styles.form}>
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.loginBtn}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>OR</span>
        </div>

        <Link to="/signup" style={{ textDecoration: "none" }}>
          <button style={styles.signupBtn}>Create New Account</button>
        </Link>

        <p style={styles.bottomText}>
          New to CrewMate?{" "}
          <Link to="/signup" style={styles.link}>
            Signup here
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
    background: "linear-gradient(to right, #141e30, #243b55)",
    padding: "20px",
  },
  card: {
    width: "420px",
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
  loginBtn: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    background: "#141e30",
    color: "white",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    margin: "20px 0px",
  },
  dividerText: {
    flex: 1,
    color: "gray",
    fontSize: "14px",
    fontWeight: "600",
  },
  signupBtn: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "2px solid #141e30",
    background: "transparent",
    color: "#141e30",
    cursor: "pointer",
    fontWeight: "bold",
  },
  bottomText: {
    textAlign: "center",
    marginTop: "18px",
    fontSize: "14px",
    color: "#444",
  },
  link: {
    color: "#141e30",
    fontWeight: "bold",
    textDecoration: "none",
  },
};

export default Login;