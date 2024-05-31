import { useAuth } from "../../contexts/AuthContext";
import React, { useState } from "react";
import { Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    setError("");

    try {
      await logout();
      navigate("/");
    } catch {
      setError("Failed to log out");
    }
  }

  return (
    <div className="navBar">
      <h2>FireBox</h2>
      <div>
        {currentUser ? (
          <button className="btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className="btn" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
        {currentUser && (
          <button className="btn" onClick={() => navigate("/profile")}>
            Profile
          </button>
        )}
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
    </div>
  );
};
export default NavBar;
