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
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto, UpdateIntegrationDto } from './integrations.dto';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateIntegrationDto) {
    const integration = await this.integrationsService.create(user.id, dto);
    return { success: true, data: integration };
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@CurrentUser() user: { id: string }, @Query('orgId') orgId: string) {
    const integrations = await this.integrationsService.findByOrg(user.id, orgId);
    return { success: true, data: integrations };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const integration = await this.integrationsService.findOne(id);
    return { success: true, data: integration };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateIntegrationDto,
  ) {
    const integration = await this.integrationsService.update(user.id, id, dto);
    return { success: true, data: integration };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.integrationsService.delete(user.id, id);
    return { success: true };
  }

  @Post(':id/test')
  @UseGuards(AuthGuard)
  async testConnection(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const result = await this.integrationsService.testConnection(id);
    return { success: true, data: result };
  }

  @Get(':id/logs')
  @UseGuards(AuthGuard)
  async getDeliveryLogs(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.integrationsService.getDeliveryLogs(
      id,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
    );
    return { success: true, data: result };
  }
}
