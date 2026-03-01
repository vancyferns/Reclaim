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
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="bg-mesh" />

            <div className="w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-emerald-500 flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg shadow-accent-primary/20">
                        R
                    </div>
                    <h1 className="text-3xl font-bold gradient-text-accent mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                        Begin Your Journey
                    </h1>
                    <p className="text-text-secondary">
                        Take the first step toward reclaiming control
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-text-secondary mb-2">
                            Display Name
                        </label>
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

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                            Email address
                        </label>
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

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                            Password
                        </label>
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

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-2">
                            Confirm Password
                        </label>
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    <p className="text-center text-sm text-text-secondary">
                        Already have an account?{' '}
                        <Link to="/login" className="text-accent-secondary hover:text-accent-primary transition-colors no-underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </form>

                {/* Privacy note */}
                <div className="text-center mt-6 space-y-1">
                    <p className="text-xs text-text-muted">
                        🔒 No browsing history tracking. No screenshots. No spying.
                    </p>
                    <p className="text-xs text-text-muted">
                        Your data stays on your server.
                    </p>
                </div>
            </div>
        </div>
    );
}
