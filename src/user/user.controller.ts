import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
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

    @Get('leaderboard')
    async getLeaderboard() {
        return this.userService.getLeaderboard();
    }
}
