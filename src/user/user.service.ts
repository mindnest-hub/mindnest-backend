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

    async updateProgress(id: string, data: { xp?: number; level?: number; badges?: string[]; streak?: number; lastLogin?: Date; moduleBalances?: any; moduleEarnings?: any }) {
        // SECURITY: Strictly allow only cosmetic/non-financial fields to be updated via this generic endpoint
        const safeFields = ['xp', 'level', 'badges', 'streak', 'lastLogin', 'moduleBalances', 'moduleEarnings'];
        const updateData: any = {};

        for (const field of safeFields) {
            if (data[field] !== undefined) {
                if (field === 'badges' && Array.isArray(data[field])) {
                    updateData[field] = JSON.stringify(data[field]);
                } else {
                    updateData[field] = data[field];
                }
            }
        }

        return this.prisma.user.update({
            where: { id },
            data: updateData,
        });
    }

    async addReward(id: string, amount: number, xp: number, actionId: string, reason?: string) {
        // SECURITY: Prevent duplicate rewards for the same actionId
        const existingEvent = await this.prisma.rewardEvent.findUnique({
            where: {
                userId_actionId: {
                    userId: id,
                    actionId: actionId
                }
            }
        });

        if (existingEvent) {
            return { success: false, message: 'Reward already claimed for this action.' };
        }

        // Transaction to ensure atomicity
        return this.prisma.$transaction(async (tx) => {
            // 1. Create the reward event record
            await tx.rewardEvent.create({
                data: {
                    userId: id,
                    actionId: actionId,
                    amount: amount,
                    reason: reason || 'In-app reward'
                }
            });

            // 1b. Log Transaction
            await tx.finTransaction.create({
                data: {
                    userId: id,
                    type: 'REWARD',
                    amount: amount,
                    reason: reason || 'In-app reward',
                    status: 'completed'
                }
            });

            // 2. Increment the user's balance and XP
            const updatedUser = await tx.user.update({
                where: { id },
                data: {
                    walletBalance: { increment: amount },
                    xp: { increment: xp }
                }
            });

            const { password, ...result } = updatedUser;
            return { success: true, user: result };
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

    async upgradeElite(id: string, duration: 'monthly' | 'yearly' = 'yearly') {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new Error('User not found');

        const costs = {
            monthly: 2000,
            yearly: 18000
        };
        const upgradeCost = costs[duration];

        // One-time earnings rule enforcement (only for yearly upgrades or first time)
        if (user.hasUsedEarningsForElite) {
            if (user.fundedBalance < upgradeCost) {
                throw new Error('Mastery renewal requires a real cash deposit via Paystack. Your one-time in-app earnings allowance has already been used.');
            }
        } else {
            if (user.walletBalance < upgradeCost) {
                throw new Error('Insufficient wallet balance to upgrade to Elite.');
            }
        }

        // Calculate expiration
        const now = new Date();
        let newExpires = new Date(now);
        const daysToAdd = duration === 'monthly' ? 30 : 365;

        if (user.isElite && user.eliteExpires && user.eliteExpires > now) {
            newExpires = new Date(user.eliteExpires);
        }
        newExpires.setDate(newExpires.getDate() + daysToAdd);

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                walletBalance: user.walletBalance - upgradeCost,
                fundedBalance: Math.max(0, user.fundedBalance - upgradeCost),
                isElite: true,
                eliteExpires: newExpires,
                hasUsedEarningsForElite: true,
                // Full Elite also includes AI Unlimited
                aiUnlimitedExpires: newExpires
            },
        });

        // Log Transaction
        await this.prisma.finTransaction.create({
            data: {
                userId: id,
                type: 'UPGRADE',
                amount: -upgradeCost,
                reason: `Elite Mastery Upgrade (${duration})`,
                status: 'completed'
            }
        });

        const { password, ...result } = updatedUser;
        return { message: `Successfully upgraded to Elite for ${duration}!`, user: result };
    }

    async purchaseAiUnlimited(userId: string, duration: 'monthly' | 'yearly') {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        const costs = {
            monthly: 1000,
            yearly: 9000
        };
        const cost = costs[duration];

        if (user.fundedBalance < cost) {
            throw new Error(`Insufficient funded balance to purchase AI Unlimited (${duration}). Please deposit more funds.`);
        }

        // Calculate expiration
        const now = new Date();
        let newExpires = new Date(now);
        const daysToAdd = duration === 'monthly' ? 30 : 365;

        if (user.aiUnlimitedExpires && user.aiUnlimitedExpires > now) {
            newExpires = new Date(user.aiUnlimitedExpires);
        }
        newExpires.setDate(newExpires.getDate() + daysToAdd);

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                fundedBalance: { decrement: cost },
                aiUnlimitedExpires: newExpires,
            },
        });

        // Log Transaction
        await this.prisma.finTransaction.create({
            data: {
                userId: userId,
                type: 'PURCHASE',
                amount: -cost,
                reason: `AI Oracle Unlimited Purchase (${duration})`,
                status: 'completed'
            }
        });

        const { password, ...result } = updatedUser;
        return { message: `AI Oracle Unlimited (${duration}) purchased successfully!`, user: result };
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

    async submitKYC(userId: string, data: { kycType: string; idNumber: string; fullName: string }) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                kycVerified: false, // In production, we don't auto-verify. We set to false and wait for admin.
                kycType: data.kycType,
                kycData: {
                    idNumber: data.idNumber,
                    fullName: data.fullName,
                    submittedAt: new Date().toISOString(),
                    status: 'pending'
                }
            }
        });
    }

    async requestWithdrawal(userId: string, amount: number, bankDetails: any) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');
        if (user.walletBalance < amount) throw new Error('Insufficient balance');
        if (!user.kycVerified) throw new Error('KYC verification required for withdrawals');

        return this.prisma.$transaction(async (tx) => {
            // 1. Create withdrawal request
            const request = await tx.withdrawalRecord.create({
                data: {
                    userId,
                    amount,
                    bankDetails,
                    status: 'pending'
                }
            });

            // 2. Deduct from wallet balance
            await tx.user.update({
                where: { id: userId },
                data: {
                    walletBalance: { decrement: amount }
                }
            });

            // 3. Log Transaction
            await tx.finTransaction.create({
                data: {
                    userId,
                    type: 'WITHDRAWAL',
                    amount: -amount,
                    reason: `Withdrawal request to ${bankDetails.bankName}`,
                    status: 'pending'
                }
            });

            return request;
        });
    }

    async getWithdrawalRequests(adminId: string, status?: string) {
        const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || !admin.isAdmin) throw new Error('Unauthorized');

        return this.prisma.withdrawalRecord.findMany({
            where: status ? { status } : {},
            include: { user: { select: { username: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getPendingKycUsers(adminId: string) {
        const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || !admin.isAdmin) throw new Error('Unauthorized');

        // Users who have kycData but kycVerified is false
        const users = await this.prisma.user.findMany({
            where: {
                kycVerified: false,
                NOT: { kycData: { equals: {} } }
            },
            select: { id: true, username: true, email: true, kycType: true, kycData: true, createdAt: true }
        });

        return users;
    }

    async updateKycStatus(adminId: string, targetUserId: string, verified: boolean) {
        const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || !admin.isAdmin) throw new Error('Unauthorized');

        return this.prisma.user.update({
            where: { id: targetUserId },
            data: { kycVerified: verified }
        });
    }

    async updateWithdrawalStatus(adminId: string, requestId: string, status: string) {
        const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || !admin.isAdmin) throw new Error('Unauthorized');

        const request = await this.prisma.withdrawalRecord.findUnique({ where: { id: requestId } });
        if (!request) throw new Error('Request not found');

        return this.prisma.$transaction(async (tx) => {
            // Update request status
            const updatedRequest = await tx.withdrawalRecord.update({
                where: { id: requestId },
                data: { status }
            });

            // If rejected, refund the user
            if (status === 'rejected') {
                await tx.user.update({
                    where: { id: request.userId },
                    data: { walletBalance: { increment: request.amount } }
                });

                // Log Refund Transaction
                await tx.finTransaction.create({
                    data: {
                        userId: request.userId,
                        type: 'WITHDRAWAL_REFUND',
                        amount: request.amount,
                        reason: 'Withdrawal rejected - funds returned',
                        status: 'completed'
                    }
                });
            } else if (status === 'paid') {
                // Update transaction status to completed
                // This is a bit tricky since we don't have the transaction ID easily
                // For now we'll just log a status update or new entry if needed
                // But typically 'pending' -> 'completed' is better.
                // Let's find the original transaction for this withdrawal
                const originalTx = await tx.finTransaction.findFirst({
                    where: {
                        userId: request.userId,
                        type: 'WITHDRAWAL',
                        amount: -request.amount,
                        status: 'pending'
                    },
                    orderBy: { createdAt: 'desc' }
                });

                if (originalTx) {
                    await tx.finTransaction.update({
                        where: { id: originalTx.id },
                        data: { status: 'completed' }
                    });
                }
            }

            return updatedRequest;
        });
    }

    async getTransactions(userId: string) {
        return this.prisma.finTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
