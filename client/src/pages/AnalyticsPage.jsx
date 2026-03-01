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

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', padding: '32px 0' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
                    <span className="gradient-text-accent">Analytics</span>
                </h1>
                <p className="text-dim" style={{ fontSize: '0.875rem', marginTop: '4px' }}>Understand your patterns to build better habits</p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
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
                    <div className="text-accent-light" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.dailyRelapses?.length || 0}</div>
                    <div className="text-dim" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Active Days (30d)</div>
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
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
        </div>
    );
}
