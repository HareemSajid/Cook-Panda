import React, { useState } from 'react';
import api from '../api';
import "../styles/authSignup.css";
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import cookingImage from "../assets/signup-img.png";
import logoImage from "../assets/panda.svg";
import { FiEye, FiEyeOff } from "react-icons/fi";
const Signup = () => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook to navigate to other routes
  const [showPassword, setShowPassword] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', formData);
      setMessage('Signup successful! Please log in.');
      setFormData({ // Reset form after success
        userName: '',
        email: '',
        password: '',
        role: 'customer',
      });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className='auth-box2'>

     <div className="logo-container">
            <img src={logoImage} alt="Logo" className="logo-image" />
            <p className="brand-name">cookpanda</p>
     </div>

    <div className="auth-container2">
      <img src={cookingImage} alt="Cooking" className="auth-image2" />
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Sign Up</h1>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="userName"
            // placeholder='Orange'
            value={formData.userName}
            onChange={handleChange}
            required
            />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            // placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            />
        </div> 
          <div className="form-group password-group">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              // placeholder="Your Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password2"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        <div className="form-group">
          <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="customer">Customer</option>
            <option value="restaurantAdmin">Restaurant Admin</option>
            <option value="deliveryWorker">Delivery Rider</option>
          </select>
        </div>
        <button type="submit" className="auth-button">Sign Up</button>
              <p>
        Already have an account?{" "}
        <button 
        type='button'
          onClick={() => navigate("/")} // Navigate to Login page
          className="link-button"
          >
          Login here
        </button>
      {message && <p className="message">{message}</p>}
      </p>

      </form>
          </div>
      
      {/* "Go to Login" Button */}
      
      
    </div>
  );
};

export default Signup;
