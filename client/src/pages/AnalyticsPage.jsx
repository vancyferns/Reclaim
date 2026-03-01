import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
    },
    scales: {
        x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#9898b0', font: { size: 11 } },
        },
        y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#9898b0', font: { size: 11 } },
            beginAtZero: true,
        },
    },
};

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const res = await api.get('/streak/analytics');
            setData(res.data);
        } catch (err) {
            console.error('Failed to load analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-3 border-accent-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-16">
                <p className="text-text-secondary">Failed to load analytics. Please try again.</p>
            </div>
        );
    }

    // --- Line Chart: Daily relapses over 30 days ---
    const lineData = {
        labels: data.dailyRelapses?.map((d) => {
            const date = new Date(d.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }) || [],
        datasets: [
            {
                label: 'Relapses',
                data: data.dailyRelapses?.map((d) => d.count) || [],
                borderColor: '#f43f5e',
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#f43f5e',
            },
        ],
    };

    // --- Doughnut Chart: Trigger breakdown ---
    const triggerColors = [
        '#6c5ce7', '#a29bfe', '#10b981', '#f59e0b',
        '#f43f5e', '#22d3ee', '#8b5cf6',
    ];

    const doughnutData = {
        labels: data.triggerBreakdown?.map((t) => t.trigger_category) || [],
        datasets: [
            {
                data: data.triggerBreakdown?.map((t) => t.count) || [],
                backgroundColor: triggerColors,
                borderColor: '#0a0a0f',
                borderWidth: 3,
            },
        ],
    };

    // --- Bar Chart: Mood comparison ---
    const avgBefore = parseFloat(data.moodAverages?.avg_mood_before || 0).toFixed(1);
    const avgAfter = parseFloat(data.moodAverages?.avg_mood_after || 0).toFixed(1);

    const moodData = {
        labels: ['Mood Before', 'Mood After'],
        datasets: [
            {
                data: [avgBefore, avgAfter],
                backgroundColor: [
                    'rgba(108, 92, 231, 0.6)',
                    'rgba(244, 63, 94, 0.6)',
                ],
                borderColor: ['#6c5ce7', '#f43f5e'],
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    <span className="gradient-text-accent">Analytics</span>
                </h1>
                <p className="text-text-secondary text-sm mt-1">
                    Understand your patterns to build better habits
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card p-5 text-center">
                    <div className="text-2xl font-bold text-emerald-400">{data.streak?.current_streak || 0}</div>
                    <div className="text-xs text-text-secondary mt-1">Current Streak</div>
                </div>
                <div className="glass-card p-5 text-center">
                    <div className="text-2xl font-bold text-amber-400">{data.streak?.longest_streak || 0}</div>
                    <div className="text-xs text-text-secondary mt-1">Best Streak</div>
                </div>
                <div className="glass-card p-5 text-center">
                    <div className="text-2xl font-bold text-rose-400">{data.totalRelapses}</div>
                    <div className="text-xs text-text-secondary mt-1">Total Relapses</div>
                </div>
                <div className="glass-card p-5 text-center">
                    <div className="text-2xl font-bold text-accent-secondary">
                        {data.dailyRelapses?.length || 0}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">Active Days (30d)</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Relapses */}
                <div className="glass-card p-6">
                    <h3 className="text-sm font-semibold text-text-secondary mb-4">Relapses — Last 30 Days</h3>
                    <div className="h-56">
                        {data.dailyRelapses?.length > 0 ? (
                            <Line data={lineData} options={chartDefaults} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-text-muted text-sm">
                                No data yet — keep tracking! 📊
                            </div>
                        )}
                    </div>
                </div>

                {/* Trigger Distribution */}
                <div className="glass-card p-6">
                    <h3 className="text-sm font-semibold text-text-secondary mb-4">Trigger Distribution</h3>
                    <div className="h-56 flex items-center justify-center">
                        {data.triggerBreakdown?.length > 0 ? (
                            <Doughnut
                                data={doughnutData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                            labels: { color: '#9898b0', font: { size: 11 }, padding: 12 },
                                        },
                                    },
                                }}
                            />
                        ) : (
                            <div className="text-text-muted text-sm">
                                Log triggers to see patterns 🔍
                            </div>
                        )}
                    </div>
                </div>

                {/* Mood Comparison */}
                <div className="glass-card p-6">
                    <h3 className="text-sm font-semibold text-text-secondary mb-4">Average Mood (Before vs After)</h3>
                    <div className="h-56">
                        {parseFloat(avgBefore) > 0 ? (
                            <Bar
                                data={moodData}
                                options={{
                                    ...chartDefaults,
                                    scales: {
                                        ...chartDefaults.scales,
                                        y: { ...chartDefaults.scales.y, max: 5 },
                                    },
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-text-muted text-sm">
                                Track moods during relapses to see this chart
                            </div>
                        )}
                    </div>
                </div>

                {/* Insights */}
                <div className="glass-card p-6">
                    <h3 className="text-sm font-semibold text-text-secondary mb-4">Insights</h3>
                    <div className="space-y-4">
                        {data.streak?.current_streak > 0 && (
                            <div className="flex gap-3">
                                <span className="text-xl">🔥</span>
                                <p className="text-sm text-text-secondary">
                                    You're on a <strong className="text-emerald-400">{data.streak.current_streak}-day</strong> streak!
                                    {data.streak.current_streak >= 7 && ' Amazing consistency!'}
                                </p>
                            </div>
                        )}
                        {data.triggerBreakdown?.length > 0 && (
                            <div className="flex gap-3">
                                <span className="text-xl">🎯</span>
                                <p className="text-sm text-text-secondary">
                                    Your top trigger is <strong className="text-accent-secondary">
                                        {data.triggerBreakdown[0].trigger_category}
                                    </strong>. Consider building specific coping strategies for this.
                                </p>
                            </div>
                        )}
                        {parseFloat(avgAfter) < parseFloat(avgBefore) && parseFloat(avgBefore) > 0 && (
                            <div className="flex gap-3">
                                <span className="text-xl">📉</span>
                                <p className="text-sm text-text-secondary">
                                    Your mood drops from <strong className="text-accent-secondary">{avgBefore}</strong> to{' '}
                                    <strong className="text-rose-400">{avgAfter}</strong> after relapses.
                                    Remember this feeling next time you face an urge.
                                </p>
                            </div>
                        )}
                        {data.totalRelapses === 0 && (
                            <div className="flex gap-3">
                                <span className="text-xl">🌟</span>
                                <p className="text-sm text-text-secondary">
                                    No relapses recorded yet. Keep going strong!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
