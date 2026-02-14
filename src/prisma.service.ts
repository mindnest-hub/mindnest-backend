import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        if (!process.env.DATABASE_URL) {
            console.error('❌ CRITICAL ERROR: DATABASE_URL environment variable is missing!');
            throw new InternalServerErrorException('DATABASE_URL is not defined in the environment.');
        }
        try {
            await this.$connect();
            console.log('✅ Connected to the database successfully.');
        } catch (error) {
            console.error('❌ Failed to connect to the database:', error.message);
            throw error;
        }
    }
}
