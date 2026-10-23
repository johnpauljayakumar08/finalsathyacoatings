import { API_BASE_URL } from "../config/api.js";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [otpChallengeId, setOtpChallengeId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const completeLogin = async (loginData) => {
    const { token, encodedUserId, redirect } = loginData;
    localStorage.setItem('token', token);
    localStorage.setItem('encodedUserId', encodedUserId);
    localStorage.setItem('loginTime', Date.now().toString());
    const response = await axios.post(`${API_BASE_URL}/auth/verify-token`, { token });
    sessionStorage.setItem('user', JSON.stringify(response.data));
    toast.success('Login successful!');
    navigate(redirect);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.requiresOtp) {
        setOtpChallengeId(response.data.challengeId);
        toast.info(response.data.message || 'A login code was sent to the Managing Director mailbox.');
        return;
      }
      await completeLogin(response.data);
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

  const handleVerifyOtp = async event => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-md-otp`, { challengeId: otpChallengeId, otp });
      setOtpChallengeId('');
      setOtp('');
      await completeLogin(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to verify login code');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      toast.success(response.data.message || 'If the email is registered, a reset link will be sent.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to request a password reset right now');
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
          {forgotPassword ? 'Reset your password' : otpChallengeId ? 'Verify your login' : 'Welcome to Sathya Coatings'}
        </h2>
        {forgotPassword ? <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input id="reset-email" type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Enter your account email" required />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-md bg-[#1e7a6f] px-4 py-2 text-white hover:bg-[#114740] disabled:opacity-60">{loading ? 'Sending...' : 'Send reset link'}</button>
          <button type="button" onClick={() => setForgotPassword(false)} className="w-full py-2 text-sm text-[#1e7a6f] hover:underline">Back to sign in</button>
        </form> : otpChallengeId ? <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-gray-600">Enter the six-digit code sent to the Managing Director login email. The code expires in five minutes.</p>
          <label htmlFor="login-otp" className="block text-sm font-medium text-gray-700">One-time password</label>
          <input id="login-otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 tracking-[0.3em]" placeholder="000000" />
          <button type="submit" disabled={loading || otp.length !== 6} className="w-full rounded-md bg-[#1e7a6f] px-4 py-2 text-white hover:bg-[#114740] disabled:opacity-60">{loading ? 'Verifying...' : 'Verify and sign in'}</button>
          <button type="button" onClick={() => { setOtpChallengeId(''); setOtp(''); }} className="w-full py-2 text-sm text-[#1e7a6f] hover:underline">Back to sign in</button>
        </form> : <form onSubmit={handleSubmit} className="space-y-4">
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
        </form>}
        <ToastContainer />
        {!forgotPassword && !otpChallengeId && <p className="mt-4 text-center text-sm text-gray-600">Forgot your password?{' '}
          <button type="button" onClick={() => setForgotPassword(true)} className="text-[#1e7a6f] hover:underline">Reset it</button>
        </p>}
      </div>
    </div>
  );
};

export default Login;