import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './billing.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @UseGuards(AuthGuard)
  async createCheckout(@CurrentUser() user: { id: string }, @Body() dto: CreateCheckoutDto) {
    const result = await this.billingService.createCheckoutSession(user.id, dto);
    return { success: true, data: result };
  }

  @Get('subscription')
  @UseGuards(AuthGuard)
  async getSubscription(@Query('orgId') orgId: string) {
    const result = await this.billingService.getSubscription(orgId);
    return { success: true, data: result };
  }

  @Get('usage')
  @UseGuards(AuthGuard)
  async getUsage(@Query('orgId') orgId: string) {
    const result = await this.billingService.getUsageSummary(orgId);
    return { success: true, data: result };
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const payload = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    const result = await this.billingService.handleWebhookEvent(payload, signature);
    return { success: true, data: result };
  }

  @Post('cancel')
  @UseGuards(AuthGuard)
  async cancelSubscription(@CurrentUser() user: { id: string }, @Body('orgId') orgId: string) {
    const result = await this.billingService.cancelSubscription(user.id, orgId);
    return { success: true, data: result };
  }
}
