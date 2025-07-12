import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import api from "../api";
import "../styles/Auth.css";
import cookingImage from "../assets/panda-login.webp";
import logoImage from "../assets/panda.svg";
import { useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", formData);
      const { token, role } = response.data;

      localStorage.setItem("token", token);
      onLogin(role);
      setMessage(`Logged in as ${role}`);
      console.log(role);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="logo-container">
        <img src={logoImage} alt="Logo" className="logo-image" />
        <p className="brand-name">cookpanda</p>
      </div>

      <div className="auth-box">
        <h2>Login</h2>
        <p>Hi, Please Login or Sign up to continue</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Your Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>
        {message && <p className="message">{message}</p>}

        <p className="account">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="link-button"
          >
            Sign up here
          </button>
        </p>
      </div>

      <img src={cookingImage} alt="Cooking" className="auth-image" />
    </div>
  );
};

export default Login;
