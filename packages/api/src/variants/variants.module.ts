import { Module } from '@nestjs/common';
import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';
import { AuthModule } from '../auth/auth.module';
import { FormsModule } from '../forms/forms.module';

@Module({
  imports: [AuthModule, FormsModule],
  controllers: [VariantsController],
  providers: [VariantsService],
  exports: [VariantsService],
})
export class VariantsModule {}
