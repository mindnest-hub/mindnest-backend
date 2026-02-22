import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SanitizationService } from '../common/sanitization.service';
import { NotificationService } from '../common/notification.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private sanitizationService: SanitizationService,
        private notificationService: NotificationService,
    ) { }

    async signup(email: string, password: string, ageGroup: string, username?: string) {
        const sanitizedEmail = this.sanitizationService.sanitize(email);
        const sanitizedUsername = username ? this.sanitizationService.sanitize(username) : `User${Math.floor(Math.random() * 10000)}`;

        const hashedPassword = await bcrypt.hash(password, 10);

        // Use findUnique to check if user exists
        let user = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: sanitizedEmail,
                    password: hashedPassword, // Dummy password since Supabase handles Auth
                    ageGroup,
                    username: sanitizedUsername,
                    isVerified: true, // Supabase handles verification
                },
            });

            // Notify Admin of new signup
            await this.notificationService.notifyAdminNewUser(
                sanitizedEmail,
                sanitizedUsername,
                ageGroup,
            );
        }

        return { message: 'Profile synced successfully', user };
    }


    async verifyOtp(email: string, code: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('User not found');

        if (user.verificationCode !== code) {
            throw new UnauthorizedException('Invalid verification code');
        }

        if (new Date() > user.verificationExpires) {
            throw new UnauthorizedException('Verification code expired');
        }

        await this.prisma.user.update({
            where: { email },
            data: {
                isVerified: true,
                verificationCode: null,
                verificationExpires: null,
            },
        });

        return this.generateToken(user);
    }

    async login(email: string, password: string) {
        const sanitizedEmail = this.sanitizationService.sanitize(email);

        const user = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        if (!user.isVerified) {
            throw new UnauthorizedException('Account not verified. Please verify your email.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        return this.generateToken(user);
    }

    private generateToken(user: any) {
        const payload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                ageGroup: user.ageGroup,
                xp: user.xp,
                level: user.level,
                walletBalance: user.walletBalance,
                streak: user.streak,
                lastLogin: user.lastLogin,
                moduleBalances: user.moduleBalances,
                moduleEarnings: user.moduleEarnings,
            },
        };
    }
}
