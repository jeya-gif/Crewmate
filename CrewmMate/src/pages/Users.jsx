import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setUsers(data);
  };

  useEffect(() => {
    if (user) fetchUsers();
  }, [user]);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>Find People</h1>

        <input
          type="text"
          placeholder="Search by username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "12px",
            width: "350px",
            maxWidth: "100%",
            marginBottom: "20px",
          }}
        />

        {filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          filteredUsers.map((u) => (
            <div key={u.id} style={styles.card}>
              <img
                src={u.profile_pic || "https://via.placeholder.com/60"}
                alt="profile"
                style={styles.img}
              />

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{u.full_name || "No Name"}</h3>
                <p style={{ margin: 0, color: "var(--muted)" }}>@{u.username}</p>
              </div>

              <Link to={`/user/${u.id}`}>
                <button style={styles.btn}>View</button>
              </Link>
            </div>
          ))
        )}
      </div>
    </>
  );
};

const styles = {
  card: {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  padding: "15px",
  background: "var(--card)",
  borderRadius: "10px",
  marginBottom: "15px",
  border: "1px solid var(--border)",
  color: "var(--text)",
  flexWrap: "wrap",
},
  img: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  btn: {
    padding: "8px 15px",
    border: "none",
    background: "black",
    color: "white",
    cursor: "pointer",
    borderRadius: "6px",
  },
};

export default Users;