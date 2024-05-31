import NavBar from "./utils/NavBar";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const LandingPage = () => {
  const { currentUser } = useAuth();

  useEffect(() => {}, []);

  return (
    <div className="landingPage">
      {currentUser ? <Navigate to="/dashboard" /> : <NavBar />}
      <div className="main">
        <h1>
          Welcome to Our Premier Cloud File Storage and Management Service!
        </h1>
        <h4>
          Discover the ultimate solution for your file storage and management
          needs with our cutting-edge cloud service. Our sleek, user-friendly
          web application is designed to simplify your life and enhance
          productivity.
        </h4>
        <ul>
          <li>Seamless Visitor Access</li>
          <li>Effortless Sign-Up and Login</li>
          <li>Fast and Secure File Downloads</li>
        </ul>
        <br />
        <br />
        <br />
        <br />
        <p style={{ color: "#ec5504" }}>FireBox © 2024 - All rights reserved</p>
      </div>
    </div>
  );
};

export default LandingPage;
