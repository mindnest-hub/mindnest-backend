import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🧪 DIAGNOSTIC: Available Environment Keys:', Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('KEY') && !k.includes('PASSWORD')));
  if (process.env.DATABASE_URL) {
    console.log('✅ DIAGNOSTIC: DATABASE_URL is visible in main.ts');
  } else {
    console.log('❌ DIAGNOSTIC: DATABASE_URL is MISSING in main.ts');
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
