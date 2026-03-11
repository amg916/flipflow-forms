import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthController } from './health.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { FormsModule } from './forms/forms.module';
import { TemplatesModule } from './templates/templates.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { VariantsModule } from './variants/variants.module';
import { ValidationModule } from './validation/validation.module';
import { validate } from './env.validation';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 60,
      },
    ]),
    AuthModule,
    FormsModule,
    TemplatesModule,
    AnalyticsModule,
    VariantsModule,
    ValidationModule,
  ],
  controllers: [HealthController],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [PrismaService],
})
export class AppModule {}
