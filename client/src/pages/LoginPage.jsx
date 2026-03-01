import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="bg-mesh" />
            <div className="auth-wrapper animate-slide-up">
                {/* Logo */}
                <div className="auth-logo">
                    <div className="logo-icon">R</div>
                    <h1 className="gradient-text-accent">Welcome Back</h1>
                    <p>Continue your journey of self-improvement</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card auth-form">
                    {error && <div className="error-box">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '4px' }}>
                        {loading ? <div className="spinner-sm" /> : 'Sign In'}
                    </button>

                    <div className="form-footer">
                        Don't have an account?{' '}
                        <Link to="/register">Create one</Link>
                    </div>
                </form>

                <div className="auth-privacy">
                    🔒 Your data never leaves your server. Fully self-hosted.
                </div>
            </div>
        </div>
    );
}
