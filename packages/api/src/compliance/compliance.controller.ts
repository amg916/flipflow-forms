import { Controller, Get, Post, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { ComplianceService } from './compliance.service';
import { SubmitConsentDto } from './compliance.dto';

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('consent')
  async recordConsent(@Body() dto: SubmitConsentDto) {
    const result = await this.complianceService.recordConsent(dto);
    return { success: true, data: result };
  }

  @Get('forms/:formId')
  @UseGuards(AuthGuard)
  async getComplianceData(
    @Param('formId') formId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.complianceService.getComplianceData(formId, startDate, endDate);
    return { success: true, data };
  }

  @Get('forms/:formId/export')
  @UseGuards(AuthGuard)
  async exportComplianceCsv(
    @Param('formId') formId: string,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const csv = await this.complianceService.exportComplianceCsv(formId, startDate, endDate);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="compliance-${formId}.csv"`);
    res.send(csv);
  }
}
