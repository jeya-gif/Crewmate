import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <h2 style={styles.logo}>CrewMate</h2>
      </div>

      <div style={styles.links}>
        <Link style={styles.link} to="/">
          Home
        </Link>

        <Link style={styles.link} to="/create">
          Create Post
        </Link>

        <Link style={styles.link} to="/inbox">
          Inbox
        </Link>

        <Link style={styles.link} to="/profile">
          Profile
        </Link>

        <Link style={styles.link} to="/users">
          Users
        </Link>

        <Link style={styles.link} to="/notifications">
          Notifications
        </Link>

        <Link style={styles.link} to="/ai-chat">
          🤖 AI
        </Link>

        <button style={styles.themeBtn} onClick={toggleTheme}>
          {theme === "dark" ? "☀ Light" : "🌙 Dark"}
        </button>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    padding: "14px 25px",

    background: "var(--card)",
    borderBottom: "1px solid var(--border)",

    position: "sticky",
    top: 0,
    zIndex: 1000,

    flexWrap: "wrap", // ✅ makes navbar responsive
    gap: "10px",
  },

  left: {
    display: "flex",
    alignItems: "center",
  },

  logo: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "bold",
    color: "var(--text)",
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: "15px",

    flexWrap: "wrap", // ✅ links go next line on mobile
    justifyContent: "center",
  },

  link: {
    color: "var(--text)",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "600",
    padding: "6px 10px",
    borderRadius: "6px",
    transition: "0.2s",
  },

  themeBtn: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
    cursor: "pointer",
    fontWeight: "bold",
  },

  logoutBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    background: "crimson",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Navbar;