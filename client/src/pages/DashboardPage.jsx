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
    const [checkins, setCheckins] = useState([]);
    const [showCheckins, setShowCheckins] = useState(false);
    const [checkinSuccess, setCheckinSuccess] = useState(false);

    const triggerOptions = ['Stress', 'Boredom', 'Loneliness', 'Anxiety', 'Insomnia', 'Social Media', 'Other'];

    const milestoneThresholds = [7, 14, 30, 60, 90, 180, 365];

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

    const loadCheckins = async () => {
        try {
            const res = await api.get('/streak/checkins?limit=10');
            setCheckins(res.data.checkins || []);
        } catch (err) {
            console.error('Failed to load checkins:', err);
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
            setCheckinSuccess(true);
            setTimeout(() => setCheckinSuccess(false), 3000);
            // Reload checkins if the panel is open
            if (showCheckins) loadCheckins();
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

    const toggleCheckins = () => {
        if (!showCheckins) loadCheckins();
        setShowCheckins(!showCheckins);
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
    const nextMilestone = milestoneThresholds.find(m => m > streakDays) || milestoneThresholds[milestoneThresholds.length - 1];
    const milestoneProgress = Math.min((streakDays / nextMilestone) * 100, 100);

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

            {/* Check-in Success Toast */}
            {checkinSuccess && (
                <div className="glass-card animate-slide-up" style={{
                    padding: '16px 24px', textAlign: 'center',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    background: 'rgba(16, 185, 129, 0.08)',
                }}>
                    <span style={{ fontSize: '1.25rem' }}>✅</span>
                    <span className="text-emerald" style={{ marginLeft: '8px', fontWeight: 600 }}>
                        Check-in recorded! Keep going 💪
                    </span>
                </div>
            )}

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

            {/* Milestone Progress */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="text-dim" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        🎯 Next Milestone: Day {nextMilestone}
                    </span>
                    <span className="text-accent-light" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {streakDays}/{nextMilestone}
                    </span>
                </div>
                <div style={{
                    width: '100%', height: '10px', borderRadius: '999px',
                    background: 'rgba(108, 92, 231, 0.1)', overflow: 'hidden',
                }}>
                    <div style={{
                        width: `${milestoneProgress}%`, height: '100%', borderRadius: '999px',
                        background: 'linear-gradient(90deg, var(--color-accent), var(--color-emerald-500))',
                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} />
                </div>
                {streakDays > 0 && (
                    <p className="text-mute" style={{ fontSize: '0.75rem', marginTop: '8px' }}>
                        {nextMilestone - streakDays} days to go — you've got this!
                    </p>
                )}
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

            {/* Check-in History Toggle */}
            <div>
                <button
                    onClick={toggleCheckins}
                    className="btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    {showCheckins ? '▲ Hide Check-in History' : '▼ View Check-in History'}
                </button>

                {showCheckins && (
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {checkins.length === 0 ? (
                            <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                                <span className="text-dim" style={{ fontSize: '0.875rem' }}>
                                    No check-ins yet. Start by clicking "Daily Check-in" above! 🌱
                                </span>
                            </div>
                        ) : (
                            checkins.map((c) => (
                                <div key={c.id} className="glass-card" style={{
                                    padding: '16px 20px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                            background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(16,185,129,0.2))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-accent-light)',
                                        }}>
                                            {c.streak_day}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                                Day {c.streak_day} Check-in
                                            </div>
                                            <div className="text-mute" style={{ fontSize: '0.75rem' }}>
                                                {new Date(c.checked_at).toLocaleDateString('en-US', {
                                                    weekday: 'short', month: 'short', day: 'numeric',
                                                })} at {new Date(c.checked_at).toLocaleTimeString('en-US', {
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="badge badge-green">✓</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
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
