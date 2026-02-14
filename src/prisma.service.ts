import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor(private configService: ConfigService) {
        super();
    }

    async onModuleInit() {
        const dbUrl = this.configService.get<string>('DATABASE_URL');
        if (!dbUrl) {
            console.error('❌ CRITICAL ERROR: DATABASE_URL is missing from ConfigService!');
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
