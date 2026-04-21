import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async (token) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await api.get('/api/auth/me');
      setUser(res.data);
    } catch {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token, id, nickname, role } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({ id, email, nickname, role });
    return res.data;
  };

  const signup = async (email, password, nickname, phone, role, businessName, businessNumber, agrees) => {
    // 동의한 약관 키 목록을 쉼표로 합쳐 백엔드에 전달 (예: "terms,privacy,ai,pet,marketing")
    const agreedKeys = agrees
      ? Object.keys(agrees).filter(k => !!agrees[k])
      : [];
    const res = await api.post('/api/auth/signup', {
      email, password, nickname, phone, role, businessName, businessNumber,
      termsAgreed: !!agrees?.terms,
      privacyAgreed: !!agrees?.privacy,
      marketingAgreed: !!agrees?.marketing,
      agreedTerms: agreedKeys.join(','),
    });
    const { token, id, role: userRole } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({ id, email, nickname, role: userRole });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    // 계정별 잔여 로컬 상태 청소 (퀴즈/미션/출석 등)
    try {
      Object.keys(localStorage).forEach(k => {
        if (
          k.startsWith('flora-quiz-') ||
          k.startsWith('flora-missions-') ||
          k === 'flora-attendance' ||
          k === 'flora-terms'
        ) {
          localStorage.removeItem(k);
        }
      });
    } catch (_) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
