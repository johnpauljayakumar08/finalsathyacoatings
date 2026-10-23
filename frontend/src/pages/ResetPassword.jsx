import { API_BASE_URL } from '../config/api.js';
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const submitReset = async event => {
    event.preventDefault();
    if (!token) return toast.error('This password reset link is missing its token. Request a new link.');
    if (password.length < 8 || password.length > 128) return toast.error('Password must be between 8 and 128 characters.');
    if (password !== confirmPassword) return toast.error('Passwords do not match.');

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, newPassword: password });
      toast.success(response.data.message || 'Password reset successful.');
      setCompleted(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to reset password. Request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <section className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex justify-center"><img className="h-20 w-20 object-contain" src="/logo_abstract.png" alt="Sathya Coatings Logo" /></div>
        <h1 className="mb-2 text-center text-2xl font-semibold text-gray-900">Choose a new password</h1>
        <p className="mb-5 text-center text-sm text-gray-600">Use 8 to 128 characters.</p>
        {completed ? <Link to="/" className="block rounded bg-[#1e7a6f] px-4 py-2 text-center text-white hover:bg-[#114740]">Return to sign in</Link> : <form onSubmit={submitReset} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">New password<input type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={event => setPassword(event.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" /></label>
          <label className="block text-sm font-medium text-gray-700">Confirm new password<input type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" /></label>
          <button type="submit" disabled={loading || !token} className="w-full rounded-md bg-[#1e7a6f] px-4 py-2 text-white hover:bg-[#114740] disabled:opacity-60">{loading ? 'Updating...' : 'Update password'}</button>
          <Link to="/" className="block text-center text-sm text-[#1e7a6f] hover:underline">Back to sign in</Link>
        </form>}
        <ToastContainer />
      </section>
    </main>
  );
};

export default ResetPassword;
