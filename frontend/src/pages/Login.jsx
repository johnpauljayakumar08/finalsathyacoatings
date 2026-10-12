import { API_BASE_URL } from "../config/api.js";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token, encodedUserId, redirect } = response.data;

      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      localStorage.setItem("token", token);
      localStorage.setItem("encodedUserId", encodedUserId);
      localStorage.setItem("loginTime", Date.now().toString());

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/verify-token`, { token });
        // setUser(response.data);
        sessionStorage.setItem('user', JSON.stringify(response.data));
        console.log('Verified user data:', response.data);
      } catch (error) {
        console.error("Token verification failed:", error);
        // handleLogout();
        toast.error("Invalid or expired token. Please log in again.");
      }

      setTimeout(() => {
        navigate(redirect);
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.error || "Failed to login", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        {/* Logo Placeholder */}
        <div className="flex justify-center mb-3">
          <div className="w-24 h-24 rounded-full">
            <img src="/logo_abstract.png" alt="Sathya Coatings Logo" />
            </div> {/* Logo placeholder */}
        </div>
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-4">
          Welcome to Sathya Coatings
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#1e7a6f] text-white py-2 px-4 rounded-md hover:bg-[#114740] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <ToastContainer />
        <p className="mt-4 text-center text-sm text-gray-600">
          Forgot your password?{" "}
          <a href="#" className="text-[#1e7a6f] hover:underline">
            Reset it
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;