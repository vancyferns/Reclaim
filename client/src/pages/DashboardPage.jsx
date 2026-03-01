import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function DashboardPage() {
    const { user, fetchProfile } = useAuth();
    const [streak, setStreak] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRelapse, setShowRelapse] = useState(false);
    const [relapseNote, setRelapseNote] = useState('');
    const [triggerCategory, setTriggerCategory] = useState('');
    const [moodBefore, setMoodBefore] = useState(3);
    const [moodAfter, setMoodAfter] = useState(3);
    const [submitting, setSubmitting] = useState(false);
    const [motivation, setMotivation] = useState('');

    const triggerOptions = ['Stress', 'Boredom', 'Loneliness', 'Anxiety', 'Insomnia', 'Social Media', 'Other'];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [streakRes, motivationRes] = await Promise.all([
                api.get('/streak'),
                api.get('/emergency/motivation'),
            ]);
            setStreak(streakRes.data);
            setMotivation(motivationRes.data.prompt);
        } catch (err) {
            console.error('Failed to load dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckin = async () => {
        try {
            const res = await api.post('/streak/checkin');
            setStreak((prev) => ({
                ...prev,
                currentStreak: res.data.currentStreak,
                longestStreak: res.data.longestStreak,
            }));
        } catch (err) {
            console.error('Check-in failed:', err);
        }
    };

    const handleRelapse = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/streak/relapse', {
                notes: relapseNote,
                triggerCategory,
                moodBefore,
                moodAfter,
            });
            setShowRelapse(false);
            setRelapseNote('');
            setTriggerCategory('');
            await loadData();
            await fetchProfile();
        } catch (err) {
            console.error('Relapse log failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    const streakDays = streak?.currentStreak || 0;
    const longestDays = streak?.longestStreak || 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Hero Section */}
            <div className="dash-hero">
                <p className="greeting">Hello, {user?.displayName} 👋</p>
                <h1 className="day-count">
                    <span className="gradient-text">Day {streakDays}</span>
                </h1>
                <p className="motivation">
                    {streakDays === 0 ? "Every journey begins with a single step." : motivation}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="glass-card stat-card">
                    <div className="icon">🔥</div>
                    <div className={`value ${streakDays >= 7 ? 'fire-text' : ''}`} style={{ color: streakDays >= 7 ? undefined : 'var(--color-txt)' }}>
                        {streakDays}
                    </div>
                    <div className="label">Current Streak</div>
                </div>

                <div className="glass-card stat-card">
                    <div className="icon">🏆</div>
                    <div className="value text-emerald">{longestDays}</div>
                    <div className="label">Longest Streak</div>
                </div>

                <div className="glass-card stat-card">
                    <div className="icon">📊</div>
                    <div className="value text-accent-light">{user?.totalRelapses || 0}</div>
                    <div className="label">Total Relapses</div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-row">
                <button onClick={handleCheckin} className="btn-primary">
                    ✅ Daily Check-in
                </button>
                <button onClick={() => setShowRelapse(true)} className="btn-danger">
                    📝 Log Relapse
                </button>
                <Link to="/emergency" className="btn-emergency">
                    🛡️ Emergency Mode
                </Link>
            </div>

            {/* Relapse Modal */}
            {showRelapse && (
                <div className="modal-overlay">
                    <div className="glass-card modal-card">
                        <h2>Log a Relapse</h2>
                        <p className="modal-desc">Honesty is the first step. This is a judgment-free zone. 🌱</p>

                        <form onSubmit={handleRelapse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Trigger */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-txt-dim)', marginBottom: '8px' }}>
                                    What triggered it?
                                </label>
                                <div className="trigger-pills">
                                    {triggerOptions.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTriggerCategory(t)}
                                            className={`trigger-pill ${triggerCategory === t ? 'active' : ''}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mood Before */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-txt-dim)', marginBottom: '8px' }}>
                                    Mood before (1-5): {moodBefore}
                                </label>
                                <input type="range" min="1" max="5" value={moodBefore} onChange={(e) => setMoodBefore(parseInt(e.target.value))} />
                            </div>

                            {/* Mood After */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-txt-dim)', marginBottom: '8px' }}>
                                    Mood after (1-5): {moodAfter}
                                </label>
                                <input type="range" min="1" max="5" value={moodAfter} onChange={(e) => setMoodAfter(parseInt(e.target.value))} />
                            </div>

                            {/* Notes */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-txt-dim)', marginBottom: '8px' }}>
                                    Notes (optional)
                                </label>
                                <textarea
                                    value={relapseNote}
                                    onChange={(e) => setRelapseNote(e.target.value)}
                                    className="input-field"
                                    placeholder="What would you do differently next time?"
                                    style={{ minHeight: '80px', resize: 'vertical' }}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" disabled={submitting} className="btn-primary">
                                    {submitting ? 'Saving...' : 'Log & Reset'}
                                </button>
                                <button type="button" onClick={() => setShowRelapse(false)} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Motivation Card */}
            <div className="glass-card motivation-card">
                <p>"{motivation}"</p>
            </div>
        </div>
    );
}
