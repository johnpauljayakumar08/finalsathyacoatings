import { API_BASE_URL } from "../config/api.js";
// Menubar.jsx (unchanged design, but ensure fetchCount is passed correctly)
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getTopMenus } from '../utils/menuData';
import { useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { User, X, Bell } from 'lucide-react';
import axios from 'axios';
import AdminNotifications from './AdminNotifications';

const Menubar = ({ onMobileMenuToggle }) => {
  const location = useLocation();
  const profileRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const user = JSON.parse(sessionStorage.getItem('user')) || {};
  const role = user.role;
  const encodedUserId = localStorage.getItem('encodedUserId');
  const topMenusData = getTopMenus(role, encodedUserId);
  const navigate = useNavigate();

  // Fetch notification count
  const fetchCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/notification/counts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'success') {
        setTotalCount(res.data.data.total);
      }
    } catch (err) {
      console.error('Error fetching count:', err);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
      localStorage.removeItem('token');
      localStorage.removeItem('encodedUserId');
      localStorage.removeItem('loginTime');
      sessionStorage.removeItem('user');
      toast.success('Logged out successfully!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="flex items-center justify-between bg-[#FAF9F6] text-[#1e7a6f] px-4 sm:px-24 shadow-md z-10 relative">
      <div className="flex items-center gap-2">
        <button
          className="lg:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-emerald-50"
          onClick={onMobileMenuToggle}
          aria-label="Open menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img src="/logo_abstract.png" alt="Logo" className="w-[75px] p-1" />
      </div>

      <ul className="hidden md:flex items-center space-x-6">
        {topMenusData
          .filter((m) => m.id !== 99)
          .map((item) => {
            const ActiveIcon = item.icon;
            const active =
              location.pathname === item.path ||
              (location.pathname.startsWith(item.activePath) && item.activePath !== '/');
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center hover:text-blue-500 transition-colors font-medium ${
                    active ?  'text-blue-600' : ''
                  }`}
                >
                  <ActiveIcon className="w-5 h-5 mr-2" />
                  {item.name}
                </Link>
              </li>
            );
          })}
      </ul>

      <div className="relative flex items-center gap-2">
        { !["siteincharge"].includes(role) && (
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="w-10 h-10 rounded-full bg-[#1e7a6f] text-white flex items-center justify-center hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 relative"
              aria-label="AdminNotifications"
            >
              <Bell size={20} />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        )}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-[#1e7a6f] text-white flex items-center justify-center hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="User Profile"
          >
            <User size={20} />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl p-4 z-50 animate-slide-in-down">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Profile</h3>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-200 transition-all duration-200 focus:outline-none"
                  aria-label="Close Profile"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-gray-600 capitalize">Name: {user.user_name}</p>
              <p className="text-sm text-gray-600">Email: {user.user_email}</p>
              <button
                onClick={handleLogout}
                className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {isNotificationOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-opacity-50 z-40"
            onClick={() => setIsNotificationOpen(false)}
          />
          {/* Expanded Sidepanel */}
          <div
            className="fixed top-16 right-0 bottom-0 w-4/5 max-w-6xl z-50 bg-white overflow-y-auto transform transition-transform duration-300 ease-in-out translate-x-0 shadow-2xl"
          >
            <AdminNotifications onClose={() => setIsNotificationOpen(false)} onCountUpdate={fetchCount} />
          </div>
        </>
      )}
    </div>
  );
};

export default Menubar;