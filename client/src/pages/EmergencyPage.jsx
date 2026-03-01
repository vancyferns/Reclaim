import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const DELAY_SECONDS = 300; // 5 minute delay timer

const TECHNIQUES = [
    { id: 'breathing', label: '🫁 Breathing Exercise', desc: 'Guided 4-7-8 breathing' },
    { id: 'grounding', label: '🌍 Grounding (5-4-3-2-1)', desc: 'Engage your five senses' },
    { id: 'movement', label: '🏃 Physical Movement', desc: 'Do push-ups or go for a walk' },
    { id: 'cold_water', label: '🧊 Cold Water', desc: 'Splash cold water on your face' },
    { id: 'journaling', label: '📝 Quick Journal', desc: 'Write down your thoughts' },
];

export default function EmergencyPage() {
    const [phase, setPhase] = useState('ready'); // ready, technique, timer, complete
    const [selectedTechnique, setSelectedTechnique] = useState(null);
    const [timer, setTimer] = useState(DELAY_SECONDS);
    const [sessionId, setSessionId] = useState(null);
    const [motivation, setMotivation] = useState('');
    const [breathPhase, setBreathPhase] = useState('inhale');
    const [breathCount, setBreathCount] = useState(0);
    const [history, setHistory] = useState([]);
    const timerRef = useRef(null);
    const breathRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        loadMotivation();
        loadHistory();
        return () => {
            clearInterval(timerRef.current);
            clearInterval(breathRef.current);
        };
    }, []);

    const loadMotivation = async () => {
        try {
            const res = await api.get('/emergency/motivation');
            setMotivation(res.data.prompt);
        } catch (e) {
            setMotivation("You are stronger than this moment.");
        }
    };

    const loadHistory = async () => {
        try {
            const res = await api.get('/emergency/history');
            setHistory(res.data.sessions || []);
        } catch (e) {
            console.error('Failed to load history', e);
        }
    };

    const startEmergency = async (technique) => {
        setSelectedTechnique(technique);
        startTimeRef.current = Date.now();

        try {
            const res = await api.post('/emergency/start', { technique: technique.id });
            setSessionId(res.data.sessionId);
        } catch (e) {
            console.error('Failed to start session', e);
        }

        setPhase('technique');

        // Start the delay timer
        setTimer(DELAY_SECONDS);
        timerRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Start breathing animation cycle if breathing technique
        if (technique.id === 'breathing') {
            startBreathingCycle();
        }
    };

    const startBreathingCycle = () => {
        // 4-7-8 breathing: 4s inhale, 7s hold, 8s exhale
        let elapsed = 0;
        breathRef.current = setInterval(() => {
            elapsed++;
            const cyclePos = elapsed % 19; // 4 + 7 + 8 = 19 seconds per cycle
            if (cyclePos < 4) {
                setBreathPhase('inhale');
            } else if (cyclePos < 11) {
                setBreathPhase('hold');
            } else {
                setBreathPhase('exhale');
            }
            if (cyclePos === 0) {
                setBreathCount((c) => c + 1);
            }
        }, 1000);
    };

    const completeSession = async (outcome) => {
        clearInterval(timerRef.current);
        clearInterval(breathRef.current);

        const durationS = Math.round((Date.now() - startTimeRef.current) / 1000);

        if (sessionId) {
            try {
                await api.put(`/emergency/${sessionId}/complete`, { outcome, durationS });
            } catch (e) {
                console.error('Failed to complete session', e);
            }
        }

        setPhase('complete');
        loadMotivation();
        loadHistory();
    };

    const resetSession = () => {
        setPhase('ready');
        setSelectedTechnique(null);
        setTimer(DELAY_SECONDS);
        setSessionId(null);
        setBreathCount(0);
        clearInterval(timerRef.current);
        clearInterval(breathRef.current);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // ─── READY PHASE ───
    if (phase === 'ready') {
        return (
            <div className="max-w-2xl mx-auto space-y-8 py-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">🛡️</div>
                    <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                        <span className="gradient-text">Emergency Mode</span>
                    </h1>
                    <p className="text-text-secondary text-lg">
                        Feeling an urge? Choose a technique to help you through it.
                    </p>
                </div>

                {/* Motivation */}
                <div className="glass-card p-6 text-center border-accent-primary/20">
                    <p className="text-lg italic text-text-secondary">"{motivation}"</p>
                </div>

                {/* Technique Selection */}
                <div className="space-y-3">
                    {TECHNIQUES.map((technique) => (
                        <button
                            key={technique.id}
                            onClick={() => startEmergency(technique)}
                            className="glass-card p-5 w-full text-left flex items-center gap-4 cursor-pointer hover:border-accent-primary/30 group"
                        >
                            <span className="text-3xl group-hover:scale-110 transition-transform">
                                {technique.label.split(' ')[0]}
                            </span>
                            <div>
                                <div className="font-semibold text-text-primary">
                                    {technique.label.split(' ').slice(1).join(' ')}
                                </div>
                                <div className="text-sm text-text-secondary">{technique.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Recent Sessions */}
                {history.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-text-secondary">Recent Sessions</h2>
                        {history.slice(0, 5).map((s) => (
                            <div key={s.id} className="glass-card p-4 flex items-center justify-between">
                                <div>
                                    <span className="text-sm text-text-secondary">
                                        {new Date(s.timestamp).toLocaleDateString()} • {s.technique}
                                    </span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.outcome === 'resisted'
                                        ? 'bg-emerald-500/15 text-emerald-400'
                                        : s.outcome === 'relapsed'
                                            ? 'bg-rose-500/15 text-rose-400'
                                            : 'bg-amber-500/15 text-amber-400'
                                    }`}>
                                    {s.outcome}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ─── TECHNIQUE PHASE ───
    if (phase === 'technique') {
        return (
            <div className="max-w-lg mx-auto text-center space-y-8 py-12">
                {/* Timer */}
                <div className="glass-card p-8">
                    <p className="text-text-secondary text-sm mb-2">Delay Timer</p>
                    <div className="text-5xl font-bold font-[var(--font-mono)] text-accent-secondary mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                        {formatTime(timer)}
                    </div>
                    <p className="text-xs text-text-muted">
                        {timer > 0 ? 'Wait it out. The urge will pass.' : 'Timer complete. How do you feel?'}
                    </p>
                </div>

                {/* Breathing Animation */}
                {selectedTechnique?.id === 'breathing' && (
                    <div className="space-y-4">
                        <div className="relative flex items-center justify-center h-48">
                            <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-accent-primary/30 to-emerald-500/30 breathing-circle flex items-center justify-center`}>
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-primary/50 to-emerald-500/50 breathing-circle flex items-center justify-center" style={{ animationDelay: '0.5s' }}>
                                    <div className="w-4 h-4 rounded-full bg-accent-primary/80" />
                                </div>
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-accent-secondary capitalize">
                            {breathPhase === 'inhale' ? '🫁 Breathe In (4s)' : breathPhase === 'hold' ? '⏸️ Hold (7s)' : '💨 Breathe Out (8s)'}
                        </div>
                        <p className="text-sm text-text-muted">Cycle {breathCount + 1}</p>
                    </div>
                )}

                {/* Grounding exercise */}
                {selectedTechnique?.id === 'grounding' && (
                    <div className="glass-card p-6 text-left space-y-3">
                        <h3 className="font-semibold text-accent-secondary">5-4-3-2-1 Grounding</h3>
                        <p className="text-text-secondary">Name:</p>
                        <ul className="space-y-2 text-text-secondary">
                            <li>👁️ <strong className="text-text-primary">5</strong> things you can <strong>see</strong></li>
                            <li>✋ <strong className="text-text-primary">4</strong> things you can <strong>touch</strong></li>
                            <li>👂 <strong className="text-text-primary">3</strong> things you can <strong>hear</strong></li>
                            <li>👃 <strong className="text-text-primary">2</strong> things you can <strong>smell</strong></li>
                            <li>👅 <strong className="text-text-primary">1</strong> thing you can <strong>taste</strong></li>
                        </ul>
                    </div>
                )}

                {/* Movement */}
                {selectedTechnique?.id === 'movement' && (
                    <div className="glass-card p-6 space-y-4">
                        <div className="text-6xl animate-bounce">🏃</div>
                        <h3 className="font-semibold text-accent-secondary text-lg">Get Moving!</h3>
                        <ul className="text-text-secondary space-y-2 text-left">
                            <li>💪 Do 20 push-ups</li>
                            <li>🧎 Do 30 squats</li>
                            <li>🚶 Go for a brisk walk</li>
                            <li>🧘 Hold a plank for 60 seconds</li>
                        </ul>
                    </div>
                )}

                {/* Cold Water */}
                {selectedTechnique?.id === 'cold_water' && (
                    <div className="glass-card p-6 space-y-4">
                        <div className="text-6xl">🧊</div>
                        <h3 className="font-semibold text-cyan-400 text-lg">Cold Water Technique</h3>
                        <p className="text-text-secondary">
                            Go splash cold water on your face. The shock activates the mammalian dive reflex,
                            slowing your heart rate and calming your nervous system.
                        </p>
                    </div>
                )}

                {/* Journaling */}
                {selectedTechnique?.id === 'journaling' && (
                    <div className="glass-card p-6 space-y-4">
                        <div className="text-6xl">📝</div>
                        <h3 className="font-semibold text-accent-secondary text-lg">Quick Journal</h3>
                        <textarea
                            className="input-field min-h-[120px] resize-y"
                            placeholder="Write freely. What are you feeling right now? What triggered this urge? What would your future self say?"
                        />
                    </div>
                )}

                {/* Motivation */}
                <p className="text-text-secondary italic text-sm">"{motivation}"</p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => completeSession('resisted')}
                        className="btn-primary text-lg py-4"
                    >
                        ✅ I Resisted — Urge Passed
                    </button>
                    <button
                        onClick={() => completeSession('relapsed')}
                        className="btn-danger py-3"
                    >
                        I couldn't hold on
                    </button>
                </div>
            </div>
        );
    }

    // ─── COMPLETE PHASE ───
    return (
        <div className="max-w-lg mx-auto text-center space-y-8 py-16 animate-slide-up">
            <div className="text-7xl">
                {history.length > 0 && history[0]?.outcome === 'resisted' ? '🏆' : '🌱'}
            </div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                <span className="gradient-text">
                    {sessionId ? 'Session Complete' : 'Session Recorded'}
                </span>
            </h1>
            <p className="text-text-secondary text-lg max-w-md mx-auto">
                {motivation}
            </p>
            <button onClick={resetSession} className="btn-secondary">
                ← Back to Emergency Mode
            </button>
        </div>
    );
}
