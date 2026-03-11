import { Module } from '@nestjs/common';
import { BotProtectionService } from './bot-protection.service';

@Module({
  providers: [BotProtectionService],
  exports: [BotProtectionService],
})
export class SecurityModule {}
