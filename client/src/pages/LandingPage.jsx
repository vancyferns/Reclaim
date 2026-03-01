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
        <div className="min-h-screen">
            <div className="bg-mesh" />

            {/* Nav */}
            <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-emerald-500 flex items-center justify-center text-lg font-bold">
                        R
                    </div>
                    <span className="text-xl font-bold gradient-text-accent" style={{ fontFamily: 'var(--font-display)' }}>
                        Reclaim
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="btn-secondary text-sm no-underline">
                        Sign In
                    </Link>
                    <Link to="/register" className="btn-primary text-sm no-underline">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="max-w-4xl mx-auto text-center px-6 py-20 md:py-32">
                <div className="animate-slide-up">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-secondary text-sm font-medium mb-6">
                        🌱 Open Source • Privacy First • Self-Hostable
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                        Take Back{' '}
                        <span className="gradient-text">Control</span>
                        <br />
                        Of Your Life
                    </h1>

                    <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
                        A privacy-respecting accountability platform for individuals who voluntarily seek to
                        regulate compulsive behavior. No judgment. No surveillance. Just support.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="btn-primary text-lg px-10 py-4 no-underline">
                            Start Your Journey →
                        </Link>
                        <a
                            href="https://github.com/vancyferns/Reclaim"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-lg px-10 py-4 no-underline"
                        >
                            ⭐ GitHub
                        </a>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-6xl mx-auto px-6 pb-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                        <span className="gradient-text-accent">Built With Purpose</span>
                    </h2>
                    <p className="text-text-secondary">
                        Every feature designed with behavioral science and privacy in mind
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="glass-card p-6"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className="text-3xl mb-3">{f.icon}</div>
                            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Principles */}
            <section className="max-w-4xl mx-auto px-6 pb-20">
                <div className="glass-card p-8 md:p-12 text-center border-accent-primary/20">
                    <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                        Our Core Principles
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                        <div className="flex gap-3">
                            <span className="text-xl">✊</span>
                            <div>
                                <div className="font-semibold mb-1">Voluntary Participation</div>
                                <p className="text-sm text-text-secondary">Users explicitly enable every feature. Nothing is forced.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-xl">🔐</span>
                            <div>
                                <div className="font-semibold mb-1">Privacy First</div>
                                <p className="text-sm text-text-secondary">No browsing history. No screenshots. No third-party analytics.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-xl">📖</span>
                            <div>
                                <div className="font-semibold mb-1">Full Transparency</div>
                                <p className="text-sm text-text-secondary">Fully open-source. Audit the code. Host it yourself.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-xl">🧠</span>
                            <div>
                                <div className="font-semibold mb-1">Science-Oriented</div>
                                <p className="text-sm text-text-secondary">Focused on accountability & interruption, not moral policing.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="text-center px-6 pb-20">
                <p className="text-text-secondary text-lg mb-6">
                    Freedom from compulsive behavior should not be restricted by paywalls.
                </p>
                <Link to="/register" className="btn-primary text-lg px-10 py-4 no-underline">
                    Begin Now — It's Free Forever
                </Link>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 px-6 py-8">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-text-muted text-sm">
                        <span className="font-semibold gradient-text-accent">Reclaim</span>
                        <span>•</span>
                        <span>MIT License</span>
                        <span>•</span>
                        <span>Made with purpose 🌱</span>
                    </div>
                    <a
                        href="https://github.com/vancyferns/Reclaim"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-text-primary text-sm transition-colors no-underline"
                    >
                        GitHub →
                    </a>
                </div>
            </footer>
        </div>
    );
}
