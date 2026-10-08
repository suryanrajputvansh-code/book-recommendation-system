import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.getMe()
      .then((data) => {
        if (isMounted && data && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // Not logged in or expired token
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setUser(data.user);
    setShowAuthModal(false);
    return data.user;
  };

  const signup = async (name, email, password) => {
    const data = await api.signup({ name, email, password });
    setUser(data.user);
    setShowAuthModal(false);
    return data.user;
  };

  const googleLogin = async (credential) => {
    const data = await api.googleAuth(credential);
    setUser(data.user);
    setShowAuthModal(false);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    showAuthModal,
    setShowAuthModal,
    login,
    signup,
    googleLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
