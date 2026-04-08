
// AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [isAuthenticated, setIsAuthenticated] = useState(() => {

    // Initialize the authentication state from sessionStorage
    const storedAuth = sessionStorage.getItem("isAuthenticated");

    return storedAuth ? JSON.parse(storedAuth) : false;

  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {

    const storedAuth = sessionStorage.getItem("isAdminAuthenticated");

    return storedAuth ? JSON.parse(storedAuth) : false;
  });

  // Function to check token expiry and automatically logout
  const checkTokenExpiry = (token,type) => {

    const { exp } = jwtDecode(token); //Getting time in seconds

    const now = new Date();

    const expiryTime = exp * 1000 - now.getTime(); // Convert to milliseconds since Js Date operates in milliseconds
    
    if (expiryTime < 0) {

      type === 'admin' ? logoutAdmin() : logout();

    } else {

      setTimeout(() => {

        type === 'admin' ? logoutAdmin() : logout(); // Automatically logout when token expires

      }, expiryTime);
    }
  };

  //user Login
  const login = (token) => {

    setIsAuthenticated(true);

    checkTokenExpiry(token); // Check token expiry

    sessionStorage.setItem('token', token);

  };

  const loginAdmin = (token) => {

    setIsAdminAuthenticated(true);

    checkTokenExpiry(token, 'admin');

    sessionStorage.setItem('adminToken', token);
  };

 const logout = () => {

    setIsAuthenticated(false);

    sessionStorage.removeItem('token');

    sessionStorage.setItem("isAuthenticated", JSON.stringify(false));

  };

  const logoutAdmin = () => {

    setIsAdminAuthenticated(false);

    sessionStorage.removeItem('adminToken');

    sessionStorage.setItem("isAdminAuthenticated", JSON.stringify(false));

  };

  // Store the authentication state in sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {

    sessionStorage.setItem("isAdminAuthenticated", JSON.stringify(isAdminAuthenticated));

  }, [isAdminAuthenticated]);

  //Added this useEffect to check token validity when the application comes into focus after OS wakes up from hibernation
  // When your computer hibernates, JavaScript timers, including those set with setTimeout, are paused and do not continue to count down while the computer is asleep. This means the logout function scheduled to run after the token's expiry will not execute at the expected time if the computer enters hibernation.

  // Upon waking from hibernation, the timer resumes, but if the scheduled time has already passed, it will execute almost immediately. However, this can lead to situations where the token is expired, but the logout action hasn't been triggered yet because the timer is effectively delayed by the hibernation period.
  useEffect(() => {

    const handleVisibilityChange = () => {

      if (!document.hidden) {

        const token = sessionStorage.getItem("token");

        const adminToken = sessionStorage.getItem("adminToken");

        if (token) {

          checkTokenExpiry(token);

        }

        if (adminToken) {

          checkTokenExpiry(adminToken, 'admin');

        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (

    <AuthContext.Provider value={{ isAuthenticated, isAdminAuthenticated, login, loginAdmin, logout, logoutAdmin }}>

      {children}

    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
