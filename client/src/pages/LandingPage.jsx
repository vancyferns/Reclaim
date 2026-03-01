import { Link } from 'react-router-dom';

export default function LandingPage() {
    const features = [
        {
            icon: '🔥',
            title: 'Streak Tracking',
            desc: 'Track your progress with daily check-ins. Watch your streak grow and celebrate milestones.',
        },
        {
            icon: '🛡️',
            title: 'Emergency Urge Mode',
            desc: 'Guided breathing, grounding exercises, and a delay timer to help you ride out the urge.',
        },
        {
            icon: '🤝',
            title: 'Accountability Partners',
            desc: 'Add trusted people who support you. Consent-driven notifications — they never see your private data.',
        },
        {
            icon: '📊',
            title: 'Smart Analytics',
            desc: 'Understand your triggers and mood patterns with visual insights. Knowledge is power.',
        },
        {
            icon: '🔒',
            title: 'Privacy First',
            desc: 'No browsing history tracking. No screenshots. No spying. Your data never leaves your server.',
        },
        {
            icon: '🌐',
            title: 'Fully Open Source',
            desc: 'MIT licensed. Self-hostable. No paywalls. No proprietary APIs. Freedom from compulsive behavior shouldn\'t cost money.',
        },
    ];

    return (
        <div style={{ minHeight: '100vh' }}>
            <div className="bg-mesh" />

            {/* Nav */}
            <nav className="landing-nav">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="app-nav" style={{ padding: 0 }}>
                        <Link to="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="logo" style={{
                                width: '36px', height: '36px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--color-accent), var(--color-emerald-500))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1rem', fontWeight: 700
                            }}>R</div>
                            <span className="gradient-text-accent" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
                                Reclaim
                            </span>
                        </Link>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link to="/login" className="btn-secondary" style={{ fontSize: '0.875rem', padding: '8px 20px' }}>
                        Sign In
                    </Link>
                    <Link to="/register" className="btn-primary" style={{ fontSize: '0.875rem', padding: '8px 20px' }}>
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="landing-hero animate-slide-up">
                <div style={{
                    display: 'inline-block', padding: '6px 16px', borderRadius: '9999px',
                    background: 'rgba(108, 92, 231, 0.08)', border: '1px solid rgba(108, 92, 231, 0.2)',
                    color: 'var(--color-accent-light)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '24px'
                }}>
                    🌱 Open Source • Privacy First • Self-Hostable
                </div>

                <h1>
                    Take Back <span className="gradient-text">Control</span>
                    <br />
                    Of Your Life
                </h1>

                <p className="subtitle">
                    A privacy-respecting accountability platform for individuals who voluntarily seek to
                    regulate compulsive behavior. No judgment. No surveillance. Just support.
                </p>

                <div className="cta-row">
                    <Link to="/register" className="btn-primary" style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
                        Start Your Journey →
                    </Link>
                    <a
                        href="https://github.com/vancyferns/Reclaim"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ fontSize: '1.1rem', padding: '16px 40px' }}
                    >
                        ⭐ GitHub
                    </a>
                </div>
            </section>

            {/* Features */}
            <section className="landing-section">
                <div className="landing-section-title">
                    <h2><span className="gradient-text-accent">Built With Purpose</span></h2>
                    <p>Every feature designed with behavioral science and privacy in mind</p>
                </div>

                <div className="features-grid">
                    {features.map((f, i) => (
                        <div key={i} className="glass-card feature-card">
                            <div className="icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Principles */}
            <section className="landing-section">
                <div className="glass-card principles-card">
                    <h2>Our Core Principles</h2>
                    <div className="principles-grid">
                        <div className="principle-item">
                            <span className="icon">✊</span>
                            <div>
                                <div className="title">Voluntary Participation</div>
                                <p className="desc">Users explicitly enable every feature. Nothing is forced.</p>
                            </div>
                        </div>
                        <div className="principle-item">
                            <span className="icon">🔐</span>
                            <div>
                                <div className="title">Privacy First</div>
                                <p className="desc">No browsing history. No screenshots. No third-party analytics.</p>
                            </div>
                        </div>
                        <div className="principle-item">
                            <span className="icon">📖</span>
                            <div>
                                <div className="title">Full Transparency</div>
                                <p className="desc">Fully open-source. Audit the code. Host it yourself.</p>
                            </div>
                        </div>
                        <div className="principle-item">
                            <span className="icon">🧠</span>
                            <div>
                                <div className="title">Science-Oriented</div>
                                <p className="desc">Focused on accountability & interruption, not moral policing.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="landing-cta">
                <p>Freedom from compulsive behavior should not be restricted by paywalls.</p>
                <Link to="/register" className="btn-primary" style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
                    Begin Now — It's Free Forever
                </Link>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-footer-inner">
                    <div className="meta">
                        <span className="gradient-text-accent" style={{ fontWeight: 600 }}>Reclaim</span>
                        <span>•</span>
                        <span>MIT License</span>
                        <span>•</span>
                        <span>Made with purpose 🌱</span>
                    </div>
                    <a
                        href="https://github.com/vancyferns/Reclaim"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-txt-mute)', fontSize: '0.875rem', transition: 'color 0.2s' }}
                    >
                        GitHub →
                    </a>
                </div>
            </footer>
        </div>
    );
}
