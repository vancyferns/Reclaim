const crypto = require('crypto');
const pool = require('../config/database');
const { sendConsentEmail } = require('../config/email');

// Add an accountability partner
exports.addPartner = async (req, res) => {
    try {
        const { partnerEmail, partnerName, notifyOnRelapse, notifyOnMilestone } = req.body;

        // Check if partner already exists for this user
        const existing = await pool.query(
            'SELECT id FROM partners WHERE user_id = $1 AND partner_email = $2',
            [req.user.id, partnerEmail.toLowerCase()]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'This partner is already added.' });
        }

        // Generate consent token
        const consentToken = crypto.randomBytes(32).toString('hex');

        const result = await pool.query(
            `INSERT INTO partners (user_id, partner_email, partner_name, notify_on_relapse, notify_on_milestone, consent_token)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, partner_email, partner_name, consent_status`,
            [
                req.user.id,
                partnerEmail.toLowerCase(),
                partnerName || null,
                notifyOnRelapse || false,
                notifyOnMilestone !== undefined ? notifyOnMilestone : true,
                consentToken,
            ]
        );

        // Get user's display name for the email
        const userRes = await pool.query(
            'SELECT display_name FROM users WHERE id = $1',
            [req.user.id]
        );
        const userName = userRes.rows[0]?.display_name || 'A Reclaim user';

        // Send consent email to partner
        sendConsentEmail({
            partnerEmail: partnerEmail.toLowerCase(),
            partnerName: partnerName || null,
            userName,
            consentToken,
        }).catch((err) => console.error('Consent email error:', err));

        res.status(201).json({
            message: 'Partner added. A consent request will be sent to their email.',
            partner: result.rows[0],
        });
    } catch (err) {
        console.error('Add partner error:', err);
        res.status(500).json({ error: 'Failed to add partner.' });
    }
};

// Get all partners
exports.getPartners = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, partner_email, partner_name, consent_status,
              notify_on_relapse, notify_on_milestone, created_at
       FROM partners WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json({ partners: result.rows });
    } catch (err) {
        console.error('Get partners error:', err);
        res.status(500).json({ error: 'Failed to fetch partners.' });
    }
};

// Remove a partner
exports.removePartner = async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM partners WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Partner not found.' });
        }

        res.json({ message: 'Partner removed successfully.' });
    } catch (err) {
        console.error('Remove partner error:', err);
        res.status(500).json({ error: 'Failed to remove partner.' });
    }
};

// Accept consent (public endpoint)
exports.acceptConsent = async (req, res) => {
    try {
        const { token } = req.params;

        const result = await pool.query(
            `UPDATE partners SET consent_status = 'accepted', updated_at = NOW()
       WHERE consent_token = $1 AND consent_status = 'pending'
       RETURNING id, partner_email`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid or expired consent token.' });
        }

        res.json({ message: 'You have accepted the accountability partner request. Thank you for your support. 🤝' });
    } catch (err) {
        console.error('Accept consent error:', err);
        res.status(500).json({ error: 'Failed to process consent.' });
    }
};

// Decline consent (public endpoint)
exports.declineConsent = async (req, res) => {
    try {
        const { token } = req.params;

        const result = await pool.query(
            `UPDATE partners SET consent_status = 'declined', updated_at = NOW()
       WHERE consent_token = $1 AND consent_status = 'pending'
       RETURNING id`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid or expired consent token.' });
        }

        res.json({ message: 'You have declined the accountability partner request.' });
    } catch (err) {
        console.error('Decline consent error:', err);
        res.status(500).json({ error: 'Failed to process consent.' });
    }
};
