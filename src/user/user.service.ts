import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (user) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async updateProgress(id: string, data: { xp?: number; level?: number; walletBalance?: number; badges?: string[]; streak?: number; lastLogin?: Date; moduleBalances?: any; moduleEarnings?: any }) {
        const updateData: any = { ...data };
        if (data.badges) {
            updateData.badges = JSON.stringify(data.badges);
        }

        return this.prisma.user.update({
            where: { id },
            data: updateData,
        });
    }

    async getLeaderboard() {
        return this.prisma.user.findMany({
            take: 10,
            orderBy: {
                xp: 'desc',
            },
            select: {
                username: true,
                walletBalance: true,
                xp: true,
            },
        });
    }

    async upgradeElite(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new Error('User not found');
        if (user.isElite) return { message: 'User is already Elite', user: await this.findOne(id) };

        const upgradeCost = 9000;

        // One-time earnings rule enforcement
        if (user.hasUsedEarningsForElite) {
            // Must have funded capital for subsequent upgrades
            if (user.fundedBalance < upgradeCost) {
                throw new Error('Mastery renewal requires a real cash deposit via Paystack. Your one-time in-app earnings allowance has already been used.');
            }
        } else {
            // First time: can use total wallet balance (including earnings)
            if (user.walletBalance < upgradeCost) {
                throw new Error('Insufficient wallet balance to upgrade to Elite.');
            }
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                walletBalance: user.walletBalance - upgradeCost,
                fundedBalance: Math.max(0, user.fundedBalance - upgradeCost),
                isElite: true,
                hasUsedEarningsForElite: true,
            },
        });

        const { password, ...result } = updatedUser;
        return { message: 'Successfully upgraded to Elite!', user: result };
    }

    async getAdminStats(adminId: string) {
        const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || !admin.isAdmin) throw new Error('Unauthorized: Admin access required');

        const totalUsers = await this.prisma.user.count();
        const totalXp = await this.prisma.user.aggregate({ _sum: { xp: true } });
        const totalRevenue = await this.prisma.user.aggregate({ _sum: { walletBalance: true } }); // This is technically current balances, for revenue we'd track actual transactions but this works as a proxy for now

        const ageGroups = await this.prisma.user.groupBy({
            by: ['ageGroup'],
            _count: { _all: true },
        });

        const eliteUsers = await this.prisma.user.count({ where: { isElite: true } });

        return {
            totalUsers,
            totalXp: totalXp._sum.xp || 0,
            totalWalletValue: totalRevenue._sum.walletBalance || 0,
            ageGroups,
            eliteUsers,
        };
    }
}
