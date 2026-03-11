import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UseTemplateDto } from './templates.dto';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // --- Public endpoints (no auth) ---

  @Get()
  async findAll(@Query('vertical') vertical?: string) {
    const templates = await this.templatesService.findAll(vertical);
    return { success: true, data: templates };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const template = await this.templatesService.findOne(id);
    return { success: true, data: template };
  }

  // --- Authenticated endpoints ---

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() dto: CreateTemplateDto) {
    const template = await this.templatesService.create(dto);
    return { success: true, data: template };
  }

  @Post(':id/use')
  @UseGuards(AuthGuard)
  async useTemplate(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UseTemplateDto,
  ) {
    const form = await this.templatesService.useTemplate(user.id, id, dto.orgId);
    return { success: true, data: form };
  }
}
