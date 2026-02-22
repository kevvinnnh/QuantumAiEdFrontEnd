import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  loading: boolean;
  login: (email: string, isAdmin: boolean) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  userEmail: null,
  loading: true,
  login: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/auth/check`, {
          withCredentials: true,
        });
        const data = res.data;
        setIsLoggedIn(data.logged_in);
        setIsAdmin(data.is_admin);
        setUserEmail(data.user_id);
      } catch {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserEmail(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback((email: string, admin: boolean) => {
    setIsLoggedIn(true);
    setIsAdmin(admin);
    setUserEmail(email);
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${BACKEND_URL}/logout`, {}, { withCredentials: true });
    } catch {
      // Logout failed, clear local state anyway
    }
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserEmail(null);
    localStorage.removeItem('loggedInUserEmail');
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, userEmail, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', backgroundColor: '#010117', color: '#fff',
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', backgroundColor: '#010117', color: '#fff',
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/map" replace />;
  }

  return <>{children}</>;
};

export default AuthContext;
