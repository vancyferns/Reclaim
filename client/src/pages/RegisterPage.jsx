import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            await register(email, password, displayName);
            navigate('/dashboard');
        } catch (err) {
            const details = err.response?.data?.details;
            if (details) {
                setError(details.map((d) => d.message).join(' '));
            } else {
                setError(err.response?.data?.error || 'Registration failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
            <div className="bg-mesh" />
            <div className="auth-wrapper animate-slide-up">
                {/* Logo */}
                <div className="auth-logo">
                    <div className="logo-icon">R</div>
                    <h1 className="gradient-text-accent">Begin Your Journey</h1>
                    <p>Take the first step toward reclaiming control</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card auth-form">
                    {error && <div className="error-box">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="displayName">Display Name</label>
                        <input
                            id="displayName"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="input-field"
                            placeholder="What should we call you?"
                            required
                            minLength={2}
                            maxLength={100}
                        />
                    </div>

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
                            placeholder="Min. 8 characters, 1 uppercase, 1 number"
                            required
                            minLength={8}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '4px' }}>
                        {loading ? <div className="spinner-sm" /> : 'Create Account'}
                    </button>

                    <div className="form-footer">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </div>
                </form>

                <div className="auth-privacy">
                    <p>🔒 No browsing history tracking. No screenshots. No spying.</p>
                    <p style={{ marginTop: '4px' }}>Your data stays on your server.</p>
                </div>
            </div>
        </div>
    );
}
