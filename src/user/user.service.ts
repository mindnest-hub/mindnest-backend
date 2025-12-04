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

    async updateProgress(id: string, data: { xp?: number; level?: number; walletBalance?: number; badges?: string[]; streak?: number; lastLogin?: Date }) {
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
                walletBalance: 'desc',
            },
            select: {
                username: true,
                walletBalance: true,
                xp: true,
            },
        });
    }
}
