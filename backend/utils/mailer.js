const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initialize the email transporter.
 * If SMTP env vars are set, use them. Otherwise, auto-generate an Ethereal test account.
 * Ethereal captures emails so you can preview them without sending real mail.
 */
const initMailer = async () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log('📧 Email configured with custom SMTP');
    } else {
        // Create Ethereal test account for development
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        console.log('📧 Email configured with Ethereal test account');
        console.log(`   Preview emails at: https://ethereal.email/login`);
        console.log(`   User: ${testAccount.user}`);
        console.log(`   Pass: ${testAccount.pass}`);
    }
};

/**
 * Send guardian approval request email
 */
const sendGuardianAlert = async (guardianEmail, guardianName, seniorName, transaction) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const info = await transporter.sendMail({
        from: '"ElderGuard System" <alerts@elderguard.app>',
        to: guardianEmail,
        subject: `⚠️ Transaction Approval Required — ₹${transaction.amount.toLocaleString('en-IN')}`,
        html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e;">🛡️ ElderGuard — Guardian Alert</h2>
        <hr style="border: 1px solid #e0e0e0;" />
        <p>Hello <strong>${guardianName}</strong>,</p>
        <p><strong>${seniorName}</strong> has initiated a transaction that requires your approval:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Amount</td><td style="padding: 8px;">₹${transaction.amount.toLocaleString('en-IN')}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #555;">Recipient</td><td style="padding: 8px;">${transaction.recipient}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Reason</td><td style="padding: 8px;">${transaction.reason || 'Not specified'}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #555;">Status</td><td style="padding: 8px; color: #e67e22; font-weight: bold;">PENDING APPROVAL</td></tr>
        </table>
        <p>Please log in to your Guardian Dashboard to approve or reject this transaction:</p>
        <a href="${frontendUrl}/guardian" style="display: inline-block; background: #2ecc71; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0;">Open Dashboard</a>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This is an automated alert from ElderGuard. Do not share this email.</p>
      </div>
    `
    });

    console.log(`📧 Guardian alert sent to ${guardianEmail}`);
    console.log(`   Preview URL: ${nodemailer.getTestMessageUrl(info) || 'N/A (real SMTP)'}`);
    return info;
};

/**
 * Send guardian invite email
 */
const sendInviteEmail = async (guardianEmail, inviteToken, seniorName) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const acceptUrl = `${frontendUrl}/invite/${inviteToken}`;

    const info = await transporter.sendMail({
        from: '"ElderGuard System" <invites@elderguard.app>',
        to: guardianEmail,
        subject: `🛡️ You've been invited as a Guardian for ${seniorName}`,
        html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e;">🛡️ ElderGuard — Guardian Invitation</h2>
        <hr style="border: 1px solid #e0e0e0;" />
        <p>Hello,</p>
        <p><strong>${seniorName}</strong> has invited you to be their trusted guardian on ElderGuard.</p>
        <p>As a guardian, you will be able to review and approve high-value transactions to help protect them from financial scams.</p>
        <a href="${acceptUrl}" style="display: inline-block; background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Accept Invitation</a>
        <p style="color: #666;">If the button doesn't work, copy this link: <br/>${acceptUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">If you did not expect this invitation, please ignore this email.</p>
      </div>
    `
    });

    console.log(`📧 Invite sent to ${guardianEmail}`);
    console.log(`   Preview URL: ${nodemailer.getTestMessageUrl(info) || 'N/A (real SMTP)'}`);
    return info;
};

module.exports = { initMailer, sendGuardianAlert, sendInviteEmail };
