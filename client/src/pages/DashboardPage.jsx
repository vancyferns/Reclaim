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
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-3 border-accent-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const streakDays = streak?.currentStreak || 0;
    const longestDays = streak?.longestStreak || 0;

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-8">
                <p className="text-text-secondary mb-2">Hello, {user?.displayName} 👋</p>
                <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                    <span className="gradient-text">Day {streakDays}</span>
                </h1>
                <p className="text-text-secondary text-lg max-w-md mx-auto">
                    {streakDays === 0 ? "Every journey begins with a single step." : motivation}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Current Streak */}
                <div className="glass-card p-6 text-center">
                    <div className="text-4xl mb-2">🔥</div>
                    <div className={`text-3xl font-bold mb-1 ${streakDays >= 7 ? 'fire-text text-amber-400' : 'text-text-primary'}`}>
                        {streakDays}
                    </div>
                    <div className="text-sm text-text-secondary">Current Streak</div>
                </div>

                {/* Longest Streak */}
                <div className="glass-card p-6 text-center">
                    <div className="text-4xl mb-2">🏆</div>
                    <div className="text-3xl font-bold mb-1 text-emerald-400">
                        {longestDays}
                    </div>
                    <div className="text-sm text-text-secondary">Longest Streak</div>
                </div>

                {/* Total Relapses */}
                <div className="glass-card p-6 text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <div className="text-3xl font-bold mb-1 text-accent-secondary">
                        {user?.totalRelapses || 0}
                    </div>
                    <div className="text-sm text-text-secondary">Total Relapses</div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={handleCheckin} className="btn-primary text-lg px-8 py-4">
                    ✅ Daily Check-in
                </button>
                <button onClick={() => setShowRelapse(true)} className="btn-danger text-lg px-8 py-4">
                    📝 Log Relapse
                </button>
                <Link to="/emergency" className="btn-emergency text-center no-underline">
                    🛡️ Emergency Mode
                </Link>
            </div>

            {/* Relapse Modal */}
            {showRelapse && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-8 w-full max-w-lg animate-slide-up">
                        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                            Log a Relapse
                        </h2>
                        <p className="text-text-secondary text-sm mb-6">
                            Honesty is the first step. This is a judgment-free zone. 🌱
                        </p>

                        <form onSubmit={handleRelapse} className="space-y-4">
                            {/* Trigger */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    What triggered it?
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {triggerOptions.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTriggerCategory(t)}
                                            className={`px-3 py-1.5 rounded-lg text-sm border cursor-pointer transition-all ${triggerCategory === t
                                                    ? 'bg-accent-primary/20 border-accent-primary text-accent-secondary'
                                                    : 'bg-transparent border-white/10 text-text-secondary hover:border-white/20'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mood Before */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Mood before (1-5): {moodBefore}
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={moodBefore}
                                    onChange={(e) => setMoodBefore(parseInt(e.target.value))}
                                    className="w-full accent-accent-primary"
                                />
                            </div>

                            {/* Mood After */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Mood after (1-5): {moodAfter}
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={moodAfter}
                                    onChange={(e) => setMoodAfter(parseInt(e.target.value))}
                                    className="w-full accent-accent-primary"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Notes (optional)
                                </label>
                                <textarea
                                    value={relapseNote}
                                    onChange={(e) => setRelapseNote(e.target.value)}
                                    className="input-field min-h-[80px] resize-y"
                                    placeholder="What would you do differently next time?"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                                    {submitting ? 'Saving...' : 'Log & Reset'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRelapse(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Motivation Card */}
            <div className="glass-card p-6 text-center">
                <p className="text-lg text-text-secondary italic">"{motivation}"</p>
            </div>
        </div>
    );
}
