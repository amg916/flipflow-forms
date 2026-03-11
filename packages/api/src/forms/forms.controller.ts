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
import { FormsService } from './forms.service';
import { CreateFormDto, UpdateFormDto, EvaluateStepDto } from './forms.dto';
import { FormDefinition } from '@flipflow/shared';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  // --- Authenticated endpoints ---

  @Post()
  @UseGuards(AuthGuard)
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateFormDto) {
    const form = await this.formsService.create(user.id, dto);
    return { success: true, data: form };
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@CurrentUser() user: { id: string }, @Query('orgId') orgId: string) {
    const forms = await this.formsService.findAllByOrg(user.id, orgId);
    return { success: true, data: forms };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const form = await this.formsService.findOneAuthed(user.id, id);
    return { success: true, data: form };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateFormDto,
  ) {
    const form = await this.formsService.update(user.id, id, dto);
    return { success: true, data: form };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.formsService.delete(user.id, id);
    return { success: true };
  }

  @Post(':id/publish')
  @UseGuards(AuthGuard)
  async publish(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const form = await this.formsService.publish(user.id, id);
    return { success: true, data: form };
  }

  @Post(':id/unpublish')
  @UseGuards(AuthGuard)
  async unpublish(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const form = await this.formsService.unpublish(user.id, id);
    return { success: true, data: form };
  }

  @Get(':id/embed')
  @UseGuards(AuthGuard)
  async getEmbedCode(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    // Verify access
    await this.formsService.findOneAuthed(user.id, id);
    const appUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    const embedCode = this.formsService.getEmbedCode(id, appUrl);
    return { success: true, data: { embedCode } };
  }

  @Get(':id/submissions')
  @UseGuards(AuthGuard)
  async listSubmissions(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.formsService.listSubmissions(user.id, id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      startDate,
      endDate,
    });
    return { success: true, data: result };
  }

  // --- Public endpoints (no auth) ---

  @Get('public/:id')
  async findPublished(@Param('id') id: string) {
    const form = await this.formsService.findPublished(id);
    return {
      success: true,
      data: {
        id: form.id,
        title: form.title,
        description: form.description,
        definition: form.definition,
      },
    };
  }

  @Post('public/:id/evaluate')
  async evaluateStep(@Param('id') id: string, @Body() dto: EvaluateStepDto) {
    const form = await this.formsService.findPublished(id);
    const result = this.formsService.evaluateFormStep(
      form.definition as unknown as FormDefinition,
      dto.stepId,
      dto.answers,
    );
    return { success: true, data: result };
  }

  @Post('public/:id/submit')
  @HttpCode(HttpStatus.CREATED)
  async submitForm(
    @Param('id') id: string,
    @Body()
    body: {
      data: Record<string, unknown>;
      metadata?: Record<string, unknown>;
      idempotencyKey?: string;
      variantId?: string;
      consentTimestamp?: string;
    },
  ) {
    const submission = await this.formsService.submitForm(id, body.data, {
      metadata: body.metadata,
      idempotencyKey: body.idempotencyKey,
      variantId: body.variantId,
      consentTimestamp: body.consentTimestamp,
    });
    return { success: true, data: { id: submission.id } };
  }
}
