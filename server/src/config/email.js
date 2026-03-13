const nodemailer = require('nodemailer');
const config = require('./env');

let transporter = null;

function getTransporter() {
    if (!transporter && config.email.host && config.email.user && config.email.pass) {
        transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.port === 465,
            auth: {
                user: config.email.user,
                pass: config.email.pass,
            },
        });
    }
    return transporter;
}

/**
 * Send an email. Fails silently if SMTP is not configured.
 */
async function sendEmail({ to, subject, html, text }) {
    const transport = getTransporter();
    if (!transport) {
        console.log('📧 Email skipped (SMTP not configured):', subject, '→', to);
        return null;
    }

    try {
        const info = await transport.sendMail({
            from: config.email.from,
            to,
            subject,
            html,
            text,
        });
        console.log('📧 Email sent:', info.messageId, '→', to);
        return info;
    } catch (err) {
        console.error('📧 Email failed:', err.message);
        return null;
    }
}

/**
 * Send a consent request email to a new accountability partner.
 */
async function sendConsentEmail({ partnerEmail, partnerName, userName, consentToken }) {
    const acceptUrl = `${config.clientUrl}/api/partners/consent/${consentToken}/accept`;
    const declineUrl = `${config.clientUrl}/api/partners/consent/${consentToken}/decline`;

    const subject = `${userName} wants you as an accountability partner on Reclaim`;

    const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #0a0a0f; color: #f0f0f5; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #6c5ce7, #10b981); color: white; font-size: 24px; font-weight: 700; line-height: 48px; text-align: center;">R</div>
            <h1 style="font-size: 20px; font-weight: 700; margin: 12px 0 4px; background: linear-gradient(135deg, #6c5ce7, #a29bfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Reclaim</h1>
        </div>

        <p style="color: #9898b0; font-size: 15px; line-height: 1.6;">
            Hi${partnerName ? ' ' + partnerName : ''},
        </p>

        <p style="color: #9898b0; font-size: 15px; line-height: 1.6;">
            <strong style="color: #f0f0f5;">${userName}</strong> has added you as an accountability partner on <strong style="color: #a29bfe;">Reclaim</strong>. This means they trust you to support their journey of self-improvement.
        </p>

        <div style="background: rgba(108, 92, 231, 0.08); border: 1px solid rgba(108, 92, 231, 0.2); border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="color: #a29bfe; font-size: 14px; margin: 0; font-weight: 500;">🔒 What this means:</p>
            <ul style="color: #9898b0; font-size: 14px; line-height: 1.8; margin: 8px 0 0; padding-left: 20px;">
                <li>You may receive optional milestone notifications</li>
                <li>You will <strong style="color: #f0f0f5;">never</strong> see their browsing history or personal data</li>
                <li>You can withdraw consent at any time</li>
            </ul>
        </div>

        <div style="text-align: center; margin: 28px 0;">
            <a href="${acceptUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #6c5ce7, #8b5cf6); color: white; border-radius: 12px; text-decoration: none; font-weight: 600; margin-right: 12px;">
                ✅ Accept
            </a>
            <a href="${declineUrl}" style="display: inline-block; padding: 12px 32px; background: rgba(244, 63, 94, 0.1); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 12px; text-decoration: none; font-weight: 600;">
                Decline
            </a>
        </div>

        <p style="color: #60607a; font-size: 12px; text-align: center; margin-top: 24px;">
            Reclaim is an open-source, privacy-first accountability platform.<br/>
            This email was sent because ${userName} added your email address.
        </p>
    </div>
    `;

    const text = `${userName} wants you as an accountability partner on Reclaim.\n\nAccept: ${acceptUrl}\nDecline: ${declineUrl}`;

    return sendEmail({ to: partnerEmail, subject, html, text });
}

/**
 * Send a milestone notification to accountability partners.
 */
async function sendMilestoneEmail({ partnerEmail, partnerName, userName, milestoneDays }) {
    const subject = `🏆 ${userName} reached a ${milestoneDays}-day milestone on Reclaim!`;

    const milestoneMessages = {
        7: "One week strong! 💪",
        14: "Two weeks of determination! 🔥",
        30: "One full month — incredible willpower! 🌟",
        60: "Two months of consistent growth! 🚀",
        90: "90 days — a true transformation! 🏆",
        180: "Half a year of unwavering commitment! ⭐",
        365: "One full year — legendary achievement! 👑",
    };

    const milestoneMsg = milestoneMessages[milestoneDays] || `${milestoneDays} days of commitment! 🎯`;

    const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #0a0a0f; color: #f0f0f5; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #6c5ce7, #10b981); color: white; font-size: 24px; font-weight: 700; line-height: 48px; text-align: center;">R</div>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px;">🏆</div>
            <h1 style="font-size: 24px; font-weight: 700; margin: 12px 0; color: #34d399;">Day ${milestoneDays}</h1>
            <p style="color: #a29bfe; font-size: 16px;">${milestoneMsg}</p>
        </div>

        <p style="color: #9898b0; font-size: 15px; line-height: 1.6; text-align: center;">
            ${partnerName ? partnerName + ', your' : 'Your'} accountability partner <strong style="color: #f0f0f5;">${userName}</strong> has reached a <strong style="color: #34d399;">${milestoneDays}-day</strong> milestone!
        </p>

        <p style="color: #9898b0; font-size: 14px; line-height: 1.6; text-align: center; margin-top: 16px;">
            Your support matters more than you know. A quick word of encouragement can go a long way. 💚
        </p>

        <p style="color: #60607a; font-size: 12px; text-align: center; margin-top: 24px;">
            Reclaim — Privacy-first accountability platform
        </p>
    </div>
    `;

    const text = `${userName} reached a ${milestoneDays}-day milestone on Reclaim! ${milestoneMsg}`;

    return sendEmail({ to: partnerEmail, subject, html, text });
}

/**
 * Send a relapse notification to accountability partners (only those who opted in).
 */
async function sendRelapseEmail({ partnerEmail, partnerName, userName }) {
    const subject = `Reclaim: ${userName} could use your support`;

    const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #0a0a0f; color: #f0f0f5; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #6c5ce7, #10b981); color: white; font-size: 24px; font-weight: 700; line-height: 48px; text-align: center;">R</div>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px;">🌱</div>
        </div>

        <p style="color: #9898b0; font-size: 15px; line-height: 1.6; text-align: center;">
            ${partnerName ? partnerName + ', ' : ''}<strong style="color: #f0f0f5;">${userName}</strong> had a setback and could use some encouragement.
        </p>

        <p style="color: #9898b0; font-size: 14px; line-height: 1.6; text-align: center; margin-top: 16px;">
            Recovery is not linear. A kind message, a check-in call, or simply being present can make all the difference. 💚
        </p>

        <div style="background: rgba(108, 92, 231, 0.08); border: 1px solid rgba(108, 92, 231, 0.2); border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="color: #a29bfe; font-size: 13px; margin: 0;">
                🔒 No details about the setback are shared. Your partner chose to be transparent with you because they trust you.
            </p>
        </div>

        <p style="color: #60607a; font-size: 12px; text-align: center; margin-top: 24px;">
            Reclaim — Privacy-first accountability platform
        </p>
    </div>
    `;

    const text = `${userName} had a setback and could use some encouragement. Recovery is not linear.`;

    return sendEmail({ to: partnerEmail, subject, html, text });
}

module.exports = {
    sendEmail,
    sendConsentEmail,
    sendMilestoneEmail,
    sendRelapseEmail,
};
