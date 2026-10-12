import { API_BASE_URL } from "../config/api.js";

import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      const loginTime = localStorage.getItem("loginTime");

      if (!token || !loginTime) {
        setIsAuthorized(false);
        toast.error("Please log in to access this page.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Check if token has expired (24 hours)
      const timeElapsed = Date.now() - parseInt(loginTime);
      const hoursElapsed = timeElapsed / (1000 * 60 * 60);
      if (hoursElapsed > 24) {
        setIsAuthorized(false);
        localStorage.removeItem("token");
        localStorage.removeItem("encodedUserId");
        localStorage.removeItem("loginTime");
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/verify-token`, { token });
        const { role: userRole } = response.data;

        // Check role matches path prefix
        const prefixToRole = {
          'superadmin': 'superadmin',
          'admin': 'admin',
          'md': 'managing_director',
          'accounts': 'accounts_team',
          'site-incharge': 'siteincharge'
        };
        const rolePrefix = params.rolePrefix || 'site-incharge';
        const expectedRole = prefixToRole[rolePrefix];
        if (expectedRole !== userRole) {
          setIsAuthorized(false);
          toast.error("Unauthorized access.", {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Token verification failed:", error);
        setIsAuthorized(false);
        toast.error("Invalid or expired token. Please log in again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    verifyToken();
  }, [navigate, params.rolePrefix]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;