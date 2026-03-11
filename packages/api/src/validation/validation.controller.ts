import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ValidationService } from './validation.service';
import { ValidateFieldDto } from './validation.dto';

@Controller('validation')
export class ValidationController {
  constructor(private readonly validationService: ValidationService) {}

  @Post('validate')
  async validate(@Body() dto: ValidateFieldDto) {
    const result = await this.validationService.validate(dto);
    return { success: true, data: result };
  }

  @Get('usage')
  @UseGuards(AuthGuard)
  async getUsage(@Query('orgId') orgId: string) {
    const usage = await this.validationService.getUsage(orgId);
    return { success: true, data: usage };
  }
}
