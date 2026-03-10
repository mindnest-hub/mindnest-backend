import { Controller, Get, Post, Delete, Body, Request, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('history')
    async getHistory(@Request() req) {
        return this.aiService.getChatHistory(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('history')
    async clearHistory(@Request() req) {
        return this.aiService.clearChatHistory(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('chat')
    async chat(@Request() req, @Body() data: { message: string, ageMode: string, topic: string, country: string }) {
        return this.aiService.processChat(req.user.userId, data);
    }
}
