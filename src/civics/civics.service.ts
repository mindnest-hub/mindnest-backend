import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CivicsService {
    constructor(private prisma: PrismaService) { }

    async saveResearchData(userId: string, data: { ageGroup: string; simulatorType: string; decisionData: any }) {
        return this.prisma.civicResearchData.create({
            data: {
                userId,
                ageGroup: data.ageGroup,
                simulatorType: data.simulatorType,
                decisionData: data.decisionData,
            },
        });
    }

    async getResearchData() {
        return this.prisma.civicResearchData.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { username: true, email: true }
                }
            }
        });
    }
}
