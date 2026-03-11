import { Controller, Get, Patch, Post, Body, UseGuards, Request, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getProfile(@Request() req) {
        // req.user is populated by JwtStrategy
        return this.userService.findOne(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('progress')
    async updateProgress(@Request() req, @Body() body: any) {
        return this.userService.updateProgress(req.user.userId, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('reward')
    async addReward(@Request() req, @Body() body: { amount: number; xp: number; actionId: string; reason?: string }) {
        return this.userService.addReward(req.user.userId, body.amount, body.xp, body.actionId, body.reason);
    }

    @Get('leaderboard')
    async getLeaderboard() {
        return this.userService.getLeaderboard();
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('upgrade-elite')
    async upgradeElite(@Request() req, @Body() body: { duration: 'monthly' | 'yearly' }) {
        return this.userService.upgradeElite(req.user.userId, body.duration);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('purchase-ai-unlimited')
    async purchaseAiUnlimited(@Request() req, @Body() body: { duration: 'monthly' | 'yearly' }) {
        return this.userService.purchaseAiUnlimited(req.user.userId, body.duration);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('admin/stats')
    async getAdminStats(@Request() req) {
        return this.userService.getAdminStats(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('transactions')
    async getTransactions(@Request() req) {
        return this.userService.getTransactions(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('kyc')
    async submitKYC(@Request() req, @Body() body: { kycType: string; idNumber: string; fullName: string }) {
        return this.userService.submitKYC(req.user.userId, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('withdraw')
    async requestWithdrawal(@Request() req, @Body() body: { amount: number; bankDetails: any }) {
        return this.userService.requestWithdrawal(req.user.userId, body.amount, body.bankDetails);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('admin/withdrawals')
    async getWithdrawalRequests(@Request() req, @Query('status') status?: string) {
        return this.userService.getWithdrawalRequests(req.user.userId, status);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('admin/kyc-pending')
    async getPendingKycUsers(@Request() req) {
        return this.userService.getPendingKycUsers(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('admin/kyc/:id')
    async updateKycStatus(@Request() req, @Param('id') id: string, @Body() body: { verified: boolean }) {
        return this.userService.updateKycStatus(req.user.userId, id, body.verified);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('admin/withdraw/:id')
    async updateWithdrawalStatus(@Request() req, @Param('id') id: string, @Body() body: { status: string }) {
        return this.userService.updateWithdrawalStatus(req.user.userId, id, body.status);
    }
}
