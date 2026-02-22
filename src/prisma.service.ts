import { Injectable, OnModuleInit, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger(PrismaService.name);

    constructor(private configService: ConfigService) {
        super();
    }

    async onModuleInit() {
        const dbUrl = this.configService.get<string>('DATABASE_URL');
        if (!dbUrl) {
            this.logger.error('CRITICAL ERROR: DATABASE_URL is missing from ConfigService!');
            throw new InternalServerErrorException('DATABASE_URL is not defined in the environment.');
        }
        try {
            await this.$connect();
            this.logger.log('Connected to the database successfully.');
        } catch (error) {
            this.logger.error(`Failed to connect to the database: ${error.message}`);
            throw error;
        }
    }
}
