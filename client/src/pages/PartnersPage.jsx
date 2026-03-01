import { useState, useEffect } from 'react';
import api from '../services/api';

export default function PartnersPage() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [partnerEmail, setPartnerEmail] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [notifyRelapse, setNotifyRelapse] = useState(false);
    const [notifyMilestone, setNotifyMilestone] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadPartners();
    }, []);

    const loadPartners = async () => {
        try {
            const res = await api.get('/partners');
            setPartners(res.data.partners);
        } catch (err) {
            console.error('Failed to load partners:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await api.post('/partners', {
                partnerEmail,
                partnerName,
                notifyOnRelapse: notifyRelapse,
                notifyOnMilestone: notifyMilestone,
            });
            setShowAdd(false);
            setPartnerEmail('');
            setPartnerName('');
            loadPartners();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add partner.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (id) => {
        if (!confirm('Remove this accountability partner?')) return;
        try {
            await api.delete(`/partners/${id}`);
            loadPartners();
        } catch (err) {
            console.error('Failed to remove partner:', err);
        }
    };

    const statusBadge = (status) => {
        const styles = {
            accepted: 'bg-emerald-500/15 text-emerald-400',
            pending: 'bg-amber-500/15 text-amber-400',
            declined: 'bg-rose-500/15 text-rose-400',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-3 border-accent-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                        <span className="gradient-text-accent">Accountability Partners</span>
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Trusted people who help you stay on track
                    </p>
                </div>
                <button onClick={() => setShowAdd(true)} className="btn-primary">
                    + Add Partner
                </button>
            </div>

            {/* Info Card */}
            <div className="glass-card p-5 border-accent-primary/20">
                <div className="flex gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                        <p className="text-sm text-text-secondary">
                            <strong className="text-text-primary">Privacy First:</strong> Partners only receive
                            notifications you explicitly enable. They never see your browsing data, notes, or any
                            personal details. All notifications are consent-driven.
                        </p>
                    </div>
                </div>
            </div>

            {/* Partners List */}
            {partners.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="text-5xl mb-4">🤝</div>
                    <h3 className="text-lg font-semibold mb-2">No partners yet</h3>
                    <p className="text-text-secondary text-sm mb-4">
                        Adding an accountability partner can significantly boost your success rate.
                    </p>
                    <button onClick={() => setShowAdd(true)} className="btn-secondary">
                        Add Your First Partner
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {partners.map((p) => (
                        <div key={p.id} className="glass-card p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-sm font-bold">
                                    {(p.partner_name || p.partner_email)[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium">{p.partner_name || 'Unnamed Partner'}</div>
                                    <div className="text-sm text-text-secondary">{p.partner_email}</div>
                                    <div className="flex gap-2 mt-1">
                                        {p.notify_on_relapse && (
                                            <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">relapse alerts</span>
                                        )}
                                        {p.notify_on_milestone && (
                                            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">milestone alerts</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {statusBadge(p.consent_status)}
                                <button
                                    onClick={() => handleRemove(p.id)}
                                    className="text-text-muted hover:text-rose-400 transition-colors cursor-pointer bg-transparent border-none text-lg"
                                    title="Remove partner"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Partner Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-8 w-full max-w-md animate-slide-up">
                        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                            Add Accountability Partner
                        </h2>
                        <p className="text-text-secondary text-sm mb-6">
                            They will receive a consent request before any notifications are sent.
                        </p>

                        <form onSubmit={handleAdd} className="space-y-4">
                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Partner's Name</label>
                                <input
                                    type="text"
                                    value={partnerName}
                                    onChange={(e) => setPartnerName(e.target.value)}
                                    className="input-field"
                                    placeholder="Their name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Partner's Email *</label>
                                <input
                                    type="email"
                                    value={partnerEmail}
                                    onChange={(e) => setPartnerEmail(e.target.value)}
                                    className="input-field"
                                    placeholder="partner@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifyMilestone}
                                        onChange={(e) => setNotifyMilestone(e.target.checked)}
                                        className="w-4 h-4 accent-emerald-500"
                                    />
                                    <span className="text-sm text-text-secondary">Notify on milestones (7, 30, 90 days)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifyRelapse}
                                        onChange={(e) => setNotifyRelapse(e.target.checked)}
                                        className="w-4 h-4 accent-rose-500"
                                    />
                                    <span className="text-sm text-text-secondary">Notify on relapse (optional, requires courage)</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                                    {submitting ? 'Adding...' : 'Send Consent Request'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowAdd(false); setError(''); }}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
