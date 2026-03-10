import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User context missing');
        }

        // Assuming the user token payload only has id and email, we need to check the DB
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id }
        });

        if (!dbUser || dbUser.role !== 'admin') {
            throw new ForbiddenException('Admin access required');
        }

        return true;
    }
}
