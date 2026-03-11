import { Module } from '@nestjs/common';
import { ValidationController } from './validation.controller';
import { ValidationService } from './validation.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ValidationController],
  providers: [ValidationService],
  exports: [ValidationService],
})
export class ValidationModule {}
