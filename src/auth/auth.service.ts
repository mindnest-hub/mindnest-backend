import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async signup(email: string, password: string, ageGroup: string, username?: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                ageGroup,
                username: username || `User${Math.floor(Math.random() * 10000)}`, // Default username if not provided
            },
        });
        return this.generateToken(user);
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

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
