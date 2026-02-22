import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { SanitizationService } from '../common/sanitization.service';
import { NotificationService } from '../common/notification.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET_KEY_CHANGE_ME',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, PrismaService, JwtStrategy, SanitizationService, NotificationService],
  controllers: [AuthController],
})
export class AuthModule { }
