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

    useEffect(() => { loadPartners(); }, []);

    const loadPartners = async () => {
        try {
            const res = await api.get('/partners');
            setPartners(res.data.partners);
        } catch (err) { console.error('Failed to load partners:', err); }
        finally { setLoading(false); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/partners', { partnerEmail, partnerName, notifyOnRelapse: notifyRelapse, notifyOnMilestone: notifyMilestone });
            setShowAdd(false);
            setPartnerEmail('');
            setPartnerName('');
            loadPartners();
        } catch (err) { setError(err.response?.data?.error || 'Failed to add partner.'); }
        finally { setSubmitting(false); }
    };

    const handleRemove = async (id) => {
        if (!confirm('Remove this accountability partner?')) return;
        try { await api.delete(`/partners/${id}`); loadPartners(); }
        catch (err) { console.error('Failed to remove partner:', err); }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', padding: '32px 0' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
                        <span className="gradient-text-accent">Accountability Partners</span>
                    </h1>
                    <p className="text-dim" style={{ fontSize: '0.875rem', marginTop: '4px' }}>Trusted people who help you stay on track</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Partner</button>
            </div>

            {/* Privacy Info */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '12px', borderColor: 'rgba(108, 92, 231, 0.2)' }}>
                <span style={{ fontSize: '1.5rem' }}>🔒</span>
                <p className="text-dim" style={{ fontSize: '0.875rem' }}>
                    <strong style={{ color: 'var(--color-txt)' }}>Privacy First:</strong> Partners only receive
                    notifications you explicitly enable. They never see your browsing data, notes, or any personal details.
                </p>
            </div>

            {/* Partners List */}
            {partners.length === 0 ? (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤝</div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>No partners yet</h3>
                    <p className="text-dim" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
                        Adding an accountability partner can significantly boost your success rate.
                    </p>
                    <button onClick={() => setShowAdd(true)} className="btn-secondary">Add Your First Partner</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {partners.map((p) => (
                        <div key={p.id} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.875rem', fontWeight: 700
                                }}>
                                    {(p.partner_name || p.partner_email)[0].toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{p.partner_name || 'Unnamed Partner'}</div>
                                    <div className="text-dim" style={{ fontSize: '0.875rem' }}>{p.partner_email}</div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                        {p.notify_on_relapse && <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>relapse alerts</span>}
                                        {p.notify_on_milestone && <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>milestone alerts</span>}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                <span className={`badge ${p.consent_status === 'accepted' ? 'badge-green' : p.consent_status === 'declined' ? 'badge-red' : 'badge-amber'}`}>
                                    {p.consent_status}
                                </span>
                                <button onClick={() => handleRemove(p.id)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--color-txt-mute)', fontSize: '1.1rem', transition: 'color 0.2s'
                                }} title="Remove partner">✕</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Partner Modal */}
            {showAdd && (
                <div className="modal-overlay">
                    <div className="glass-card modal-card">
                        <h2>Add Accountability Partner</h2>
                        <p className="modal-desc">They will receive a consent request before any notifications are sent.</p>

                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {error && <div className="error-box" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '12px', padding: '12px 16px', color: 'var(--color-rose-400)', fontSize: '0.875rem' }}>{error}</div>}

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-txt-dim)', marginBottom: '8px' }}>Partner's Name</label>
                                <input type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} className="input-field" placeholder="Their name" />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-txt-dim)', marginBottom: '8px' }}>Partner's Email *</label>
                                <input type="email" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} className="input-field" placeholder="partner@example.com" required />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={notifyMilestone} onChange={(e) => setNotifyMilestone(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--color-emerald-500)' }} />
                                    <span className="text-dim" style={{ fontSize: '0.875rem' }}>Notify on milestones (7, 30, 90 days)</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={notifyRelapse} onChange={(e) => setNotifyRelapse(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--color-rose-500)' }} />
                                    <span className="text-dim" style={{ fontSize: '0.875rem' }}>Notify on relapse (optional, requires courage)</span>
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Adding...' : 'Send Consent Request'}</button>
                                <button type="button" onClick={() => { setShowAdd(false); setError(''); }} className="btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
