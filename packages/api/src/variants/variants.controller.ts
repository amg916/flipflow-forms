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
import { VariantsService } from './variants.service';
import { CreateVariantDto, UpdateVariantDto } from './variants.dto';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateVariantDto) {
    const variant = await this.variantsService.create(user.id, dto);
    return { success: true, data: variant };
  }

  @Get()
  @UseGuards(AuthGuard)
  async findByForm(@CurrentUser() user: { id: string }, @Query('formId') formId: string) {
    const variants = await this.variantsService.findByForm(formId);
    return { success: true, data: variants };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateVariantDto,
  ) {
    const variant = await this.variantsService.update(user.id, id, dto);
    return { success: true, data: variant };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.variantsService.delete(user.id, id);
    return { success: true };
  }

  @Get('assign/:formId')
  async assignVariant(@Param('formId') formId: string) {
    const result = await this.variantsService.assignVariant(formId);
    return { success: true, data: result };
  }
}
