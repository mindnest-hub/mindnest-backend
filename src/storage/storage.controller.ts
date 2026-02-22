import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('file/:id')
    async getFile(@Param('id') id: string, @Request() req) {
        // req.user.userId is available for ownership check
        return this.storageService.checkOwnership(id, req.user.userId);
    }
}
