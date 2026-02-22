import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    /**
     * Sends a 6-digit OTP to the specified recipient (email or phone)
     */
    async sendOTP(to: string, code: string): Promise<void> {
        // In production, you would integrate Twilio or SendGrid here
        // For now, we log it to the server console so the user can see it
        this.logger.log(`
|-----------------------------------------------|
|  MindNest OTP VERIFICATION                   |
|  To: ${to}                                    |
|  Code: ${code}                               |
|  Expires in: 15 minutes                      |
|-----------------------------------------------|
    `);

        // Explicitly notify in development mode
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV] Verification Code for ${to} is: ${code}`);
        }
    }

    /**
     * Notifies admin of a new user signup
     */
    async notifyAdminNewUser(email: string, name: string, ageGroup: string): Promise<void> {
        this.logger.log(`
|-----------------------------------------------|
|  ADMIN NOTIFICATION: NEW USER SIGNUP         |
|  Name: ${name}                                |
|  Email: ${email}                               |
|  Age Group: ${ageGroup}                       |
|-----------------------------------------------|
        `);

        // In production, this could send an email to the admin or a message to Slack/Discord
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[ADMIN-ALERT] New user ${name} (${email}) joined MindNest as ${ageGroup}`);
        }
    }
}
