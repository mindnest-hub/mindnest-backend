import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    /**
     * Sends a real email using the Resend API
     */
    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            this.logger.warn('RESEND_API_KEY not found in environment. Email not sent.');
            this.logger.log(`[FALLBACK LOG] To: ${to} | Subject: ${subject}`);
            return;
        }

        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    from: 'MindNest <onboarding@resend.dev>', // Default free domain, user should verify their domain later
                    to,
                    subject,
                    html,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                this.logger.error('Failed to send email via Resend', error);
            } else {
                this.logger.log(`Email successfully sent to ${to}`);
            }
        } catch (error) {
            this.logger.error('Error calling Resend API', error);
        }
    }

    /**
     * Sends a 6-digit OTP to the specified recipient
     */
    async sendOTP(to: string, code: string): Promise<void> {
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #FFD700; text-align: center;">MindNest</h2>
                <p>Hello,</p>
                <p>Thank you for joining MindNest! Please use the following verification code to complete your signup:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; color: #333;">${code}</span>
                </div>
                <p>This code will expire in 15 minutes.</p>
                <p>If you did not request this code, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 MindNest. Empowering the next generation.</p>
            </div>
        `;
        await this.sendEmail(to, 'Your MindNest Verification Code 🦁', html);
    }

    /**
     * Notifies admin of a new user signup
     */
    async notifyAdminNewUser(email: string, name: string, ageGroup: string): Promise<void> {
        const html = `
            <h3>New User Signup Alert! 🚀</h3>
            <p>A new user has joined MindNest:</p>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Age Group:</strong> ${ageGroup}</li>
            </ul>
        `;
        // Send to admin email (could be configurable via env)
        await this.sendEmail('mindnest.bond@gmail.com', `New User: ${name} (${ageGroup})`, html);
    }
}

