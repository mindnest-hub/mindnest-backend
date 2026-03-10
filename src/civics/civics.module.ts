import { Module } from '@nestjs/common';
import { CivicsController } from './civics.controller';
import { CivicsService } from './civics.service';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [CivicsController],
    providers: [CivicsService, PrismaService],
})
export class CivicsModule { }
