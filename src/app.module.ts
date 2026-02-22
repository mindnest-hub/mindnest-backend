import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma.service';
import { PaymentModule } from './payment/payment.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 3600000, // 1 hour
      limit: 10, // 10 requests per hour globally (more restrictive for auth later)
    }]),
    AuthModule,
    UserModule,
    PaymentModule,
    StorageModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    RedirectService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [PrismaService],
})
export class AppModule { }
