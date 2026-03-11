import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto, UpdateWebhookDto } from './webhooks.dto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateWebhookDto) {
    const webhook = await this.webhooksService.create(user.id, dto);
    return { success: true, data: webhook };
  }

  @Get()
  @UseGuards(AuthGuard)
  async findByOrg(@CurrentUser() user: { id: string }, @Query('orgId') orgId: string) {
    const webhooks = await this.webhooksService.findByOrg(user.id, orgId);
    return { success: true, data: webhooks };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const webhook = await this.webhooksService.findOne(id);
    return { success: true, data: webhook };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
  ) {
    const webhook = await this.webhooksService.update(user.id, id, dto);
    return { success: true, data: webhook };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.webhooksService.delete(user.id, id);
    return { success: true };
  }

  @Get(':id/logs')
  @UseGuards(AuthGuard)
  async getDeliveryLogs(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.webhooksService.getDeliveryLogs(
      id,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
    );
    return { success: true, data: result };
  }

  @Post(':id/logs/:logId/replay')
  @UseGuards(AuthGuard)
  async replayDelivery(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Param('logId') logId: string,
  ) {
    const result = await this.webhooksService.replayDelivery(logId);
    return { success: true, data: result };
  }

  @Post('test/:id')
  @UseGuards(AuthGuard)
  async testWebhook(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const testData = {
      _test: true,
      _timestamp: new Date().toISOString(),
      sampleField1: 'Test value 1',
      sampleField2: 'Test value 2',
    };

    await this.webhooksService.deliverWebhook(id, `test-${Date.now()}`, testData);
    return { success: true, data: { message: 'Test webhook delivered' } };
  }
}
