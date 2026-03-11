import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto, TrackBatchDto } from './analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // --- Public endpoints (no auth) ---

  @Post('track')
  @HttpCode(HttpStatus.CREATED)
  async trackEvent(@Body() dto: TrackEventDto) {
    const event = await this.analyticsService.trackEvent(dto);
    return { success: true, data: { id: event.id } };
  }

  @Post('track/batch')
  @HttpCode(HttpStatus.CREATED)
  async trackBatch(@Body() dto: TrackBatchDto) {
    const result = await this.analyticsService.trackBatch(dto.events);
    return { success: true, data: { count: result.count } };
  }

  // --- Authenticated endpoints ---

  @Get('forms/:formId')
  @UseGuards(AuthGuard)
  async getFormAnalytics(
    @Param('formId') formId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    let data;

    if (start && end) {
      data = await this.analyticsService.getFormAnalyticsByDateRange(
        formId,
        new Date(start),
        new Date(end),
      );
    } else {
      data = await this.analyticsService.getFormAnalytics(formId);
    }

    return { success: true, data };
  }
}
