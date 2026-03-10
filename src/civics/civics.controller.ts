import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { CivicsService } from './civics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('civics')
export class CivicsController {
    constructor(private readonly civicsService: CivicsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('research')
    async submitResearchData(@Req() req: any, @Body() data: any) {
        return this.civicsService.saveResearchData(req.user.id, data);
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Get('admin/research')
    async getAdminResearchData() {
        return this.civicsService.getResearchData();
    }
}
