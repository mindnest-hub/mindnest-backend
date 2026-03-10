import { Module } from '@nestjs/common';
import { CivicsController } from './civics.controller';
import { CivicsService } from './civics.service';
import { PrismaService } from '../prisma.service';
import { AdminGuard } from '../auth/admin.guard';

@Module({
    controllers: [CivicsController],
    providers: [CivicsService, PrismaService, AdminGuard],
})
export class CivicsModule { }
