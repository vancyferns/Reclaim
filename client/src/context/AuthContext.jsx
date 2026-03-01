import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('reclaim_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            setUser(res.data.user);
        } catch {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('reclaim_token', newToken);
        setToken(newToken);
        setUser(userData);
        return res.data;
    };

    const register = async (email, password, displayName) => {
        const res = await api.post('/auth/register', { email, password, displayName });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('reclaim_token', newToken);
        setToken(newToken);
        setUser(userData);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('reclaim_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
}
