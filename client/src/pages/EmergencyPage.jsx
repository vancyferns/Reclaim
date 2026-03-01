import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const DELAY_SECONDS = 300;

const TECHNIQUES = [
    { id: 'breathing', label: '🫁 Breathing Exercise', desc: 'Guided 4-7-8 breathing' },
    { id: 'grounding', label: '🌍 Grounding (5-4-3-2-1)', desc: 'Engage your five senses' },
    { id: 'movement', label: '🏃 Physical Movement', desc: 'Do push-ups or go for a walk' },
    { id: 'cold_water', label: '🧊 Cold Water', desc: 'Splash cold water on your face' },
    { id: 'journaling', label: '📝 Quick Journal', desc: 'Write down your thoughts' },
];

export default function EmergencyPage() {
    const [phase, setPhase] = useState('ready');
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
        } catch {
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
        setTimer(DELAY_SECONDS);
        timerRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) { clearInterval(timerRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);

        if (technique.id === 'breathing') {
            startBreathingCycle();
        }
    };

    const startBreathingCycle = () => {
        let elapsed = 0;
        breathRef.current = setInterval(() => {
            elapsed++;
            const cyclePos = elapsed % 19;
            if (cyclePos < 4) setBreathPhase('inhale');
            else if (cyclePos < 11) setBreathPhase('hold');
            else setBreathPhase('exhale');
            if (cyclePos === 0) setBreathCount((c) => c + 1);
        }, 1000);
    };

    const completeSession = async (outcome) => {
        clearInterval(timerRef.current);
        clearInterval(breathRef.current);
        const durationS = Math.round((Date.now() - startTimeRef.current) / 1000);

        if (sessionId) {
            try { await api.put(`/emergency/${sessionId}/complete`, { outcome, durationS }); }
            catch (e) { console.error('Failed to complete session', e); }
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
            <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', padding: '32px 0' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🛡️</div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>
                        <span className="gradient-text">Emergency Mode</span>
                    </h1>
                    <p className="text-dim" style={{ fontSize: '1.1rem' }}>
                        Feeling an urge? Choose a technique to help you through it.
                    </p>
                </div>

                <div className="glass-card motivation-card" style={{ borderColor: 'rgba(108, 92, 231, 0.2)' }}>
                    <p>"{motivation}"</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {TECHNIQUES.map((technique) => (
                        <button
                            key={technique.id}
                            onClick={() => startEmergency(technique)}
                            className="glass-card"
                            style={{
                                padding: '20px', width: '100%', textAlign: 'left',
                                display: 'flex', alignItems: 'center', gap: '16px',
                                cursor: 'pointer', background: 'rgba(26, 26, 38, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.06)', fontFamily: 'var(--font-body)', color: 'var(--color-txt)'
                            }}
                        >
                            <span style={{ fontSize: '1.75rem' }}>{technique.label.split(' ')[0]}</span>
                            <div>
                                <div style={{ fontWeight: 600 }}>{technique.label.split(' ').slice(1).join(' ')}</div>
                                <div className="text-dim" style={{ fontSize: '0.875rem' }}>{technique.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {history.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 className="text-dim" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Sessions</h2>
                        {history.slice(0, 5).map((s) => (
                            <div key={s.id} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="text-dim" style={{ fontSize: '0.875rem' }}>
                                    {new Date(s.timestamp).toLocaleDateString()} • {s.technique}
                                </span>
                                <span className={`badge ${s.outcome === 'resisted' ? 'badge-green' : s.outcome === 'relapsed' ? 'badge-red' : 'badge-amber'}`}>
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
            <div style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '32px', padding: '48px 0' }}>
                <div className="glass-card" style={{ padding: '32px' }}>
                    <p className="text-dim" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>Delay Timer</p>
                    <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-accent-light)', marginBottom: '8px' }}>
                        {formatTime(timer)}
                    </div>
                    <p className="text-mute" style={{ fontSize: '0.75rem' }}>
                        {timer > 0 ? 'Wait it out. The urge will pass.' : 'Timer complete. How do you feel?'}
                    </p>
                </div>

                {selectedTechnique?.id === 'breathing' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '192px' }}>
                            <div className="breathing-circle" style={{
                                width: '128px', height: '128px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(108,92,231,0.3), rgba(16,185,129,0.3))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <div className="breathing-circle" style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, rgba(108,92,231,0.5), rgba(16,185,129,0.5))',
                                    animationDelay: '0.5s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(108,92,231,0.8)' }} />
                                </div>
                            </div>
                        </div>
                        <div className="text-accent-light" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                            {breathPhase === 'inhale' ? '🫁 Breathe In (4s)' : breathPhase === 'hold' ? '⏸️ Hold (7s)' : '💨 Breathe Out (8s)'}
                        </div>
                        <p className="text-mute" style={{ fontSize: '0.875rem' }}>Cycle {breathCount + 1}</p>
                    </div>
                )}

                {selectedTechnique?.id === 'grounding' && (
                    <div className="glass-card" style={{ padding: '24px', textAlign: 'left' }}>
                        <h3 className="text-accent-light" style={{ fontWeight: 600, marginBottom: '12px' }}>5-4-3-2-1 Grounding</h3>
                        <p className="text-dim" style={{ marginBottom: '8px' }}>Name:</p>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-txt-dim)' }}>
                            <li>👁️ <strong style={{ color: 'var(--color-txt)' }}>5</strong> things you can <strong>see</strong></li>
                            <li>✋ <strong style={{ color: 'var(--color-txt)' }}>4</strong> things you can <strong>touch</strong></li>
                            <li>👂 <strong style={{ color: 'var(--color-txt)' }}>3</strong> things you can <strong>hear</strong></li>
                            <li>👃 <strong style={{ color: 'var(--color-txt)' }}>2</strong> things you can <strong>smell</strong></li>
                            <li>👅 <strong style={{ color: 'var(--color-txt)' }}>1</strong> thing you can <strong>taste</strong></li>
                        </ul>
                    </div>
                )}

                {selectedTechnique?.id === 'movement' && (
                    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '3.5rem' }}>🏃</div>
                        <h3 className="text-accent-light" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Get Moving!</h3>
                        <ul style={{ listStyle: 'none', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-txt-dim)' }}>
                            <li>💪 Do 20 push-ups</li>
                            <li>🧎 Do 30 squats</li>
                            <li>🚶 Go for a brisk walk</li>
                            <li>🧘 Hold a plank for 60 seconds</li>
                        </ul>
                    </div>
                )}

                {selectedTechnique?.id === 'cold_water' && (
                    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '3.5rem' }}>🧊</div>
                        <h3 className="text-cyan" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Cold Water Technique</h3>
                        <p className="text-dim">
                            Go splash cold water on your face. The shock activates the mammalian dive reflex,
                            slowing your heart rate and calming your nervous system.
                        </p>
                    </div>
                )}

                {selectedTechnique?.id === 'journaling' && (
                    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '3.5rem' }}>📝</div>
                        <h3 className="text-accent-light" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Quick Journal</h3>
                        <textarea
                            className="input-field"
                            placeholder="Write freely. What are you feeling right now?"
                            style={{ minHeight: '120px', resize: 'vertical', width: '100%' }}
                        />
                    </div>
                )}

                <p className="text-dim" style={{ fontStyle: 'italic', fontSize: '0.875rem' }}>"{motivation}"</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button onClick={() => completeSession('resisted')} className="btn-primary" style={{ fontSize: '1.1rem', padding: '16px' }}>
                        ✅ I Resisted — Urge Passed
                    </button>
                    <button onClick={() => completeSession('relapsed')} className="btn-danger" style={{ padding: '12px' }}>
                        I couldn't hold on
                    </button>
                </div>
            </div>
        );
    }

    // ─── COMPLETE PHASE ───
    return (
        <div className="animate-slide-up" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', padding: '64px 0' }}>
            <div style={{ fontSize: '4.5rem' }}>
                {history.length > 0 && history[0]?.outcome === 'resisted' ? '🏆' : '🌱'}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>
                <span className="gradient-text">Session Complete</span>
            </h1>
            <p className="text-dim" style={{ fontSize: '1.1rem', maxWidth: '480px' }}>{motivation}</p>
            <button onClick={resetSession} className="btn-secondary">← Back to Emergency Mode</button>
        </div>
    );
}
