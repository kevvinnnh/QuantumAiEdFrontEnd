import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
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
        setIsLoggedIn(data.authenticated);
        setIsAdmin(data.is_admin);
        setUserEmail(data.email);
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
      await axios.post(`${BACKEND_URL}/auth/logout`, {}, { withCredentials: true });
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

export const AdminToggle: React.FC = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  if (loading || !isAdmin) return null;

  const isOnAdmin = location.pathname === '/admin-dashboard';
  const label = isOnAdmin ? 'Dashboard' : 'Admin';
  const target = isOnAdmin ? '/map' : '/admin-dashboard';

  return (
    <button
      onClick={() => navigate(target)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 10000,
        padding: '8px 16px',
        backgroundColor: hovered ? '#2563eb' : '#1e3a5f',
        color: '#fff',
        border: '1px solid #3b82f6',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        transition: 'background-color 0.15s',
      }}
      title={isOnAdmin ? 'Go to Dashboard' : 'Go to Admin Dashboard'}
    >
      {label}
    </button>
  );
};

export default AuthContext;
