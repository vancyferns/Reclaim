import { useState, useEffect } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#9898b0', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#9898b0', font: { size: 11 } }, beginAtZero: true },
    },
};

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => { loadAnalytics(); }, []);

    const loadAnalytics = async () => {
        try { const res = await api.get('/streak/analytics'); setData(res.data); }
        catch (err) { console.error('Failed to load analytics:', err); }
        finally { setLoading(false); }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!data) {
        return <div style={{ textAlign: 'center', padding: '64px 0' }}><p className="text-dim">Failed to load analytics. Please try again.</p></div>;
    }

    // ─── Chart Data ───
    const lineData = {
        labels: data.dailyRelapses?.map((d) => { const date = new Date(d.date); return `${date.getMonth() + 1}/${date.getDate()}`; }) || [],
        datasets: [{
            label: 'Relapses', data: data.dailyRelapses?.map((d) => d.count) || [],
            borderColor: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.1)',
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#f43f5e',
        }],
    };

    const triggerColors = ['#6c5ce7', '#a29bfe', '#10b981', '#f59e0b', '#f43f5e', '#22d3ee', '#8b5cf6'];
    const doughnutData = {
        labels: data.triggerBreakdown?.map((t) => t.trigger_category) || [],
        datasets: [{ data: data.triggerBreakdown?.map((t) => t.count) || [], backgroundColor: triggerColors, borderColor: '#0a0a0f', borderWidth: 3 }],
    };

    const avgBefore = parseFloat(data.moodAverages?.avg_mood_before || 0).toFixed(1);
    const avgAfter = parseFloat(data.moodAverages?.avg_mood_after || 0).toFixed(1);
    const moodData = {
        labels: ['Mood Before', 'Mood After'],
        datasets: [{ data: [avgBefore, avgAfter], backgroundColor: ['rgba(108,92,231,0.6)', 'rgba(244,63,94,0.6)'], borderColor: ['#6c5ce7', '#f43f5e'], borderWidth: 1, borderRadius: 8 }],
    };

    // Weekly relapses chart
    const weeklyData = {
        labels: data.weeklyRelapses?.map((w) => {
            const date = new Date(w.week);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }) || [],
        datasets: [{
            label: 'Relapses', data: data.weeklyRelapses?.map((w) => w.count) || [],
            backgroundColor: 'rgba(108, 92, 231, 0.5)',
            borderColor: '#6c5ce7', borderWidth: 1, borderRadius: 6,
        }],
    };

    // Hourly distribution chart
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourlyMap = {};
    (data.hourlyRelapses || []).forEach(h => { hourlyMap[h.hour] = parseInt(h.count); });
    const hourlyData = {
        labels: hours.map(h => `${h.toString().padStart(2, '0')}:00`),
        datasets: [{
            label: 'Relapses', data: hours.map(h => hourlyMap[h] || 0),
            backgroundColor: hours.map(h => {
                const count = hourlyMap[h] || 0;
                if (count === 0) return 'rgba(255,255,255,0.03)';
                const maxCount = Math.max(...Object.values(hourlyMap), 1);
                const intensity = 0.2 + (count / maxCount) * 0.6;
                return `rgba(244, 63, 94, ${intensity})`;
            }),
            borderColor: 'transparent', borderRadius: 4,
        }],
    };

    // Check-in activity chart
    const checkinChartData = {
        labels: data.checkinActivity?.map((d) => {
            const date = new Date(d.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }) || [],
        datasets: [{
            label: 'Check-ins', data: data.checkinActivity?.map((d) => d.count) || [],
            borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#10b981',
        }],
    };

    const tabs = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'patterns', label: '🔍 Patterns' },
        { id: 'activity', label: '📅 Activity' },
    ];

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', padding: '32px 0' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
                    <span className="gradient-text-accent">Analytics</span>
                </h1>
                <p className="text-dim" style={{ fontSize: '0.875rem', marginTop: '4px' }}>Understand your patterns to build better habits</p>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(26, 26, 38, 0.4)', borderRadius: '12px', padding: '4px' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1, padding: '10px 16px', borderRadius: '10px',
                            background: activeTab === tab.id ? 'rgba(108, 92, 231, 0.15)' : 'transparent',
                            border: activeTab === tab.id ? '1px solid rgba(108, 92, 231, 0.3)' : '1px solid transparent',
                            color: activeTab === tab.id ? 'var(--color-accent-light)' : 'var(--color-txt-dim)',
                            cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.875rem',
                            fontWeight: activeTab === tab.id ? 600 : 400, transition: 'all 0.2s',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Summary Cards — always visible */}
            <div className="analytics-summary-grid">
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <div className="text-emerald" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.streak?.current_streak || 0}</div>
                    <div className="text-dim" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Current Streak</div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <div className="text-amber" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.streak?.longest_streak || 0}</div>
                    <div className="text-dim" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Best Streak</div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <div className="text-rose" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.totalRelapses}</div>
                    <div className="text-dim" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Total Relapses</div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <div className="text-accent-light" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {data.checkinActivity?.length || 0}
                    </div>
                    <div className="text-dim" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Check-in Days (30d)</div>
                </div>
            </div>

            {/* ─── OVERVIEW TAB ─── */}
            {activeTab === 'overview' && (
                <div className="analytics-charts-grid">
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 className="text-dim" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>Relapses — Last 30 Days</h3>
                        <div style={{ height: '224px' }}>
                            {data.dailyRelapses?.length > 0 ? (
                                <Line data={lineData} options={chartDefaults} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }} className="text-mute">No data yet — keep tracking! 📊</div>
                            )}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 className="text-dim" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>Trigger Distribution</h3>
                        <div style={{ height: '224px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {data.triggerBreakdown?.length > 0 ? (
                                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#9898b0', font: { size: 11 }, padding: 12 } } } }} />
                            ) : (
                                <span className="text-mute">Log triggers to see patterns 🔍</span>
                            )}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 className="text-dim" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>Average Mood (Before vs After)</h3>
                        <div style={{ height: '224px' }}>
                            {parseFloat(avgBefore) > 0 ? (
                                <Bar data={moodData} options={{ ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, max: 5 } } }} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }} className="text-mute">Track moods during relapses</div>
                            )}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 className="text-dim" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>Insights</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {data.streak?.current_streak > 0 && (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <span style={{ fontSize: '1.25rem' }}>🔥</span>
                                    <p className="text-dim" style={{ fontSize: '0.875rem' }}>
                                        You're on a <strong className="text-emerald">{data.streak.current_streak}-day</strong> streak!
                                        {data.streak.current_streak >= 7 && ' Amazing consistency!'}
                                    </p>
                                </div>
                            )}
                            {data.triggerBreakdown?.length > 0 && (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <span style={{ fontSize: '1.25rem' }}>🎯</span>
                                    <p className="text-dim" style={{ fontSize: '0.875rem' }}>
                                        Your top trigger is <strong className="text-accent-light">{data.triggerBreakdown[0].trigger_category}</strong>. Consider building specific coping strategies.
                                    </p>
                                </div>
                            )}
                            {parseFloat(avgAfter) < parseFloat(avgBefore) && parseFloat(avgBefore) > 0 && (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <span style={{ fontSize: '1.25rem' }}>📉</span>
                                    <p className="text-dim" style={{ fontSize: '0.875rem' }}>
                                        Your mood drops from <strong className="text-accent-light">{avgBefore}</strong> to <strong className="text-rose">{avgAfter}</strong> after relapses.
                                    </p>
                                </div>
                            )}
                            {data.totalRelapses === 0 && (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <span style={{ fontSize: '1.25rem' }}>🌟</span>
                                    <p className="text-dim" style={{ fontSize: '0.875rem' }}>No relapses recorded yet. Keep going strong!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── PATTERNS TAB ─── */}
            {activeTab === 'patterns' && (
                <div className="analytics-charts-grid">
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 className="text-dim" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>
                            Weekly Trend (12 Weeks)
                        </h3>
                        <div style={{ height: '224px' }}>
                            {data.weeklyRelapses?.length > 0 ? (
                                <Bar data={weeklyData} options={chartDefaults} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }} className="text-mute">
                                    Not enough data yet — keep tracking! 📈
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 className="text-dim" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>
                            Time of Day Distribution
                        </h3>
                        <div style={{ height: '224px' }}>
                            {data.hourlyRelapses?.length > 0 ? (
                                <Bar data={hourlyData} options={{
                                    ...chartDefaults,
                                    scales: {
                                        ...chartDefaults.scales,
                                        x: { ...chartDefaults.scales.x, ticks: { ...chartDefaults.scales.x.ticks, maxRotation: 90, font: { size: 9 } } },
                                    },
                                }} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }} className="text-mute">
                                    Track relapses to discover time patterns ⏰
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pattern Insights */}
                    <div className="glass-card" style={{ padding: '24px', gridColumn: '1 / -1' }}>
                        <h3 className="text-dim" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>
                            🧠 Pattern Analysis
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {data.hourlyRelapses?.length > 0 && (() => {
                                const peakHour = data.hourlyRelapses.reduce((a, b) => parseInt(a.count) > parseInt(b.count) ? a : b);
                                const hour = parseInt(peakHour.hour);
                                const period = hour < 6 ? 'late night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
                                return (
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <span style={{ fontSize: '1.25rem' }}>⏰</span>
                                        <p className="text-dim" style={{ fontSize: '0.875rem' }}>
                                            You're most vulnerable in the <strong className="text-accent-light">{period}</strong> (around {hour.toString().padStart(2, '0')}:00).
                                            Consider planning activities or routines during this time.
                                        </p>
                                    </div>
                                );
                            })()}
                            {data.weeklyRelapses?.length >= 2 && (() => {
                                const counts = data.weeklyRelapses.map(w => parseInt(w.count));
                                const recent = counts[counts.length - 1];
                                const previous = counts[counts.length - 2];
                                const trend = recent < previous ? 'improving' : recent > previous ? 'needs attention' : 'stable';
                                return (
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <span style={{ fontSize: '1.25rem' }}>{trend === 'improving' ? '📈' : trend === 'needs attention' ? '⚠️' : '➡️'}</span>
                                        <p className="text-dim" style={{ fontSize: '0.875rem' }}>
                                            Your weekly trend is <strong className={trend === 'improving' ? 'text-emerald' : trend === 'needs attention' ? 'text-rose' : 'text-accent-light'}>{trend}</strong>.
                                            {trend === 'improving' && ' Great progress!'}
                                            {trend === 'needs attention' && ' Consider using emergency mode proactively.'}
                                        </p>
                                    </div>
                                );
                            })()}
                            {(!data.hourlyRelapses || data.hourlyRelapses.length === 0) && (!data.weeklyRelapses || data.weeklyRelapses.length === 0) && (
                                <p className="text-mute" style={{ fontSize: '0.875rem', textAlign: 'center', padding: '24px 0' }}>
                                    More data needed to detect patterns. Keep logging to unlock insights! 🔮
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── ACTIVITY TAB ─── */}
            {activeTab === 'activity' && (
                <div className="analytics-charts-grid">
                    <div className="glass-card" style={{ padding: '24px', gridColumn: '1 / -1' }}>
                        <h3 className="text-dim" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>
                            Check-in Activity (30 Days)
                        </h3>
                        <div style={{ height: '224px' }}>
                            {data.checkinActivity?.length > 0 ? (
                                <Line data={checkinChartData} options={chartDefaults} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }} className="text-mute">
                                    Start checking in daily to see your activity! ✅
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Summary */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 className="text-dim" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>
                            📊 Engagement Summary
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="text-dim" style={{ fontSize: '0.875rem' }}>Check-in days (30d)</span>
                                <span className="text-emerald" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                    {data.checkinActivity?.length || 0}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="text-dim" style={{ fontSize: '0.875rem' }}>Consistency rate</span>
                                <span className="text-accent-light" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                    {data.checkinActivity?.length ? Math.round((data.checkinActivity.length / 30) * 100) : 0}%
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="text-dim" style={{ fontSize: '0.875rem' }}>Relapse-free days</span>
                                <span className="text-emerald" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                    {30 - (data.dailyRelapses?.length || 0)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="text-dim" style={{ fontSize: '0.875rem' }}>Journey started</span>
                                <span className="text-accent-light" style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                    {data.streak?.start_date
                                        ? new Date(data.streak.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Streak milestones achieved */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 className="text-dim" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>
                            🏆 Milestones
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[7, 14, 30, 60, 90, 180, 365].map((milestone) => {
                                const achieved = (data.streak?.longest_streak || 0) >= milestone;
                                return (
                                    <div key={milestone} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 14px', borderRadius: '10px',
                                        background: achieved ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255,255,255,0.02)',
                                        border: achieved ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(255,255,255,0.04)',
                                    }}>
                                        <span style={{
                                            fontSize: '0.875rem',
                                            color: achieved ? 'var(--color-emerald-400)' : 'var(--color-txt-mute)',
                                            fontWeight: achieved ? 600 : 400,
                                        }}>
                                            {achieved ? '✅' : '⬜'} Day {milestone}
                                        </span>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: achieved ? 'var(--color-emerald-400)' : 'var(--color-txt-mute)',
                                        }}>
                                            {achieved ? 'Achieved!' : 'Locked'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
